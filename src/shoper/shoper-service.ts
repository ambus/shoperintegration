import { getLogger, Logger } from "log4js";
import { BehaviorSubject, Observable, OperatorFunction, Subject, throwError, zip, merge, empty, of, iif } from "rxjs";
import { catchError, delay, map, share, switchMap, tap, finalize, mergeMap, skipWhile, filter } from "rxjs/operators";
import { Config } from "../config/config";
import { FilonMerchandise } from "../models/filon-merchandise";
import { Task } from "../models/task";
import { TaskShoperRequestStatusValue } from "../models/task-shoper-request-status-value";
import { ShoperGetToken } from "./shoper-get-token";
import { createTaskRequest } from "./utils/create-task-request";
import { setEndTime } from "./utils/set-end-time";
import { setStatus } from "./utils/set-status";
import { ErrorTask } from "../models/error-task";
import { EMail } from "../mail/email";
import { ShoperStockService } from "./shoper-stock-service/shoper-stock-service";
import { ShoperUpdateService } from "./shoper-update-service/shoper-update-service";
import { CompareService } from "./compare-service/compare-service";

export class ShoperService {
  logger: Logger;
  filonMerchandiseAdd$: Subject<FilonMerchandise> = new Subject();
  connectionPoolIsFree$: Subject<void> = new BehaviorSubject(null);
  errorStream$: Subject<Task> = new Subject<Task>();
  eMail: EMail;
  shoperStockService: ShoperStockService;
  shoperUpdateService: ShoperUpdateService;
  compareService: CompareService;

  constructor(public config: Config) {
    this.logger = getLogger("ShoperService");
    this.eMail = new EMail(config);
    this.shoperStockService = new ShoperStockService(config);
    this.shoperUpdateService = new ShoperUpdateService(config);
    this.compareService = new CompareService();
  }

  addTask(filonMerchandise: FilonMerchandise): void {
    this.filonMerchandiseAdd$.next(filonMerchandise);
  }

  _taskRequest$: Observable<Task> = this.filonMerchandiseAdd$.pipe(
    tap((filonMerchandise: FilonMerchandise) => this.logger.debug("Dodano nowy towar do strumienia tasków", filonMerchandise)),
    map(createTaskRequest),
    share()
  );

  doingTask$: Observable<Task> = merge(this.errorStream$.pipe(map((task: Task) => [task, empty()])), zip(this._taskRequest$, this.connectionPoolIsFree$)).pipe(
    map(([s, f]) => s),
    setStatus(TaskShoperRequestStatusValue.making),
    tap((task: Task) => task.attemptCounter++),
    switchMap((task: Task) =>
      of(task).pipe(
        this.setConnectionToken(),
        this.shoperStockService.setShoperStock(),
        this.compareService.generateItemToUpdate(),
        this.shoperUpdateService.updateShoperStock(),
        catchError(err => {
          err.status = TaskShoperRequestStatusValue.error;
          return of(err);
        }),
        finalize(() => this.logger.debug("Zakończono działanie sekwencji w switchMap - doingTask"))
      )
    ),
    finalize(() => this.logger.warn("Zakończono działanie całej sekcji doingTask"))
  );

  setConnectionToken(): OperatorFunction<Task, Task> {
    return (source: Observable<Task>) => {
      let taskToUpdate: Task;
      let refreshToken = taskToUpdate && taskToUpdate.status === TaskShoperRequestStatusValue.error ? true : false;
      return source.pipe(
        tap((task: Task) => (taskToUpdate = task)),
        switchMap(
          (task: Task) => this.getToken(refreshToken),
          (outerValue, innerValue, outerIndex, innerIndex) => ({
            outerValue,
            innerValue,
            outerIndex,
            innerIndex
          })
        ),
        map((val: { outerValue: Task; innerValue: string; outerIndex: number; innerIndex: number }) => {
          val.outerValue.shoperConnectionTokenID = val.innerValue;
          this.logger.debug(`Pobrany token połączenia: ${val.innerValue}`);
          return val.outerValue;
        }),
        catchError(err => {
          this.logger.error(`Napotkano błąd podczas ustawiania tokena połączenia: `, err, taskToUpdate);
          return throwError(new ErrorTask(taskToUpdate, err));
        })
      );
    };
  }

  getToken(refresh: boolean = false): Observable<string> {
    return ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, refresh, Config.getInstance().shoperConfig.delayTimeInMilisec, Config.getInstance().shoperConfig.maxRetryAttempts);
  }

  doneTask$: Observable<Task> = this.doingTask$.pipe(
    mergeMap((task: Task) =>
      iif(
        () => this.isErrorObject(task) && task.attemptCounter < this.config.shoperConfig.maxRetryAttempts,
        of(task).pipe(tap((task: Task) => this.errorStream$.next(task))),
        of(task).pipe(
          mergeMap((task: Task) =>
            iif(
              () => task.status === TaskShoperRequestStatusValue.error,
              of(task).pipe(
                tap((request: Task) => this.logger.error(`Nie udało się wykonać zadania o id ${request.id}.`)),
                tap((task: Task) => {
                  this.logger.error("Próba wysłania maila")
                  let message = `Podczas próby aktualizacji danych w systemie Shoper dla towaru o symbolu ${
                    task.filonMerchandise.product_code
                  }, napotkano błąd. Prawdopodobnie dane który miały zostać zakutalizowane nie zostały przesłane na serwer. Prosimy o ręczną aktualizację ponieważ dane które są w systemie shoper nie będą odpowiadały prawdzie. Z programu Filon otrzymano dane(kod, ilość, cena, cenaE): ${
                    task.filonMerchandise.product_code
                  } | ${task.filonMerchandise.stock} | ${task.filonMerchandise.price} | ${task.filonMerchandise.priceE}. Dane na temat towaru przekazane przez system shoper: ${JSON.stringify(
                    task
                  )}. Treść błędu: ${task["message"]}`;
                  let messageHtml = `<h2>Błąd</h2>
                  <h3>Podczas próby aktualizacji danych w systemie Shoper dla towaru o symbolu ${task.filonMerchandise.product_code}, napotkano błąd!</h3>
                  <p>Prawdopodobnie dane który miały zostać zakutalizowane nie zostały przesłane na serwer.</p>
                  <p style="color: red">Prosimy o ręczną aktualizację ponieważ dane które są w systemie shoper nie będą odpowiadały prawdzie.</p>
                  <p style="">Z programu Filon otrzymano dane: <pre>
                  <code>${JSON.stringify(task.filonMerchandise, null, 4)}</code></pre></p>
                  <p>Dane na temat towaru przekazane przez system shoper: <pre><code>${JSON.stringify(task)}</code></pre></p>
                  <p>Treść błędu: ${JSON.stringify(task["message"])}</p>
                  <br />
                  <p><i>Zadanie przekazane do systemu: </i><pre><code>${JSON.stringify(task["message"])}</code></pre></p>
                  `;
                  this.eMail.sendMail(`Nie można ukończyć zadania aktualizacji danych towaru ${task.filonMerchandise.product_code}`, message, messageHtml, ["s.standarski@kim24.pl"]);
                })
              ),
              of(task).pipe(setStatus(TaskShoperRequestStatusValue.done))
            )
          )
        )
      )
    ),
    filter((task: Task) => !(this.isErrorObject(task) && task.attemptCounter < this.config.shoperConfig.maxRetryAttempts)),
    this.endTask(),
    setEndTime(),
    tap((request: Task) => this.logger.info(`Zakończono pracę przy zadaniu o id ${request.id}, czas zakończenia pracy ${new Date(request.endTime).toLocaleTimeString()}.`)),
    tap((request: Task) => this.connectionPoolIsFree$.next()),
    catchError(err => {
      this.logger.error(`Napotkano błąd podczas próby wykonania zadania.`, err);

      this.eMail.sendMail("Nie można ukończyć zadania aktualizacji danych towaru - strumień został wstrzymany i jest niezbędny jego restart", err);
      return throwError(err);
    }),
    finalize(() => this.logger.error("Strumień zakończył pracę")) //TODO ten strumień nie powinien nigdy zakończyć pracy. Wysłać @ lub smsa z powiadomieniem o napotkanym zakończeniu działania
  );

  endTask(): OperatorFunction<Task, Task> {
    return (source: Observable<Task>) =>
      source.pipe(
        delay(this.config.shoperConfig.delayTimeInMilisec),
        tap((request: Task) => this.logger.info(`Wykonano zadanie o id ${request.id}`))
      );
  }

  isErrorObject(data: any): boolean {
    return data.constructor.name === "ErrorTask" || (data.status && data.status === TaskShoperRequestStatusValue.error);
  }
}
