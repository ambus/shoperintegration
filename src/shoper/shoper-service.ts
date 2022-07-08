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
import { EMail } from "../mail/email";
import { ShoperStockService } from "./shoper-stock-service/shoper-stock-service";
import { ShoperUpdateService } from "./shoper-update-service/shoper-update-service";
import { CompareService } from "./compare-service/compare-service";
import { ErrorType } from "../models/error-type";

export class ShoperService {
  logger: Logger;
  filonMerchandiseAdd$: Subject<FilonMerchandise> = new Subject();
  connectionPoolIsFree$: Subject<void> = new BehaviorSubject(null);
  errorStream$: Subject<Task> = new Subject<Task>();
  eMail: EMail;
  shoperStockService: ShoperStockService;
  shoperUpdateService: ShoperUpdateService;
  compareService: CompareService;
  config: Config;

  constructor(public configuration: Config) {
    this.config = configuration;
    this.logger = getLogger("ShoperService");
    this.eMail = new EMail(this.config);
    this.shoperStockService = new ShoperStockService(this.config);
    this.shoperUpdateService = new ShoperUpdateService(this.config);
    this.compareService = new CompareService();
  }

  addTask(filonMerchandise: FilonMerchandise): void {
    this.logger.debug(`Nowe zadanie dla produktu o kodzie: ${filonMerchandise.product_code}`);
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
        catchError((err) => {
          task.status = TaskShoperRequestStatusValue.error;
          task.error = err;
          return of(task);
        }),
        finalize(() => this.logger.debug("Zakończono działanie sekwencji w switchMap - doingTask"))
      )
    ),
    finalize(() => this.logger.debug("Zakończono działanie całej sekcji doingTask"))
  );

  setConnectionToken(): OperatorFunction<Task, Task> {
    return (source: Observable<Task>) => {
      let taskToUpdate: Task;
      return source.pipe(
        tap((task: Task) => (taskToUpdate = task)),
        switchMap(
          (task: Task) => this.getToken(task && (task.status === TaskShoperRequestStatusValue.error ? true : false)),
          (outerValue, innerValue, outerIndex, innerIndex) => ({
            outerValue,
            innerValue,
            outerIndex,
            innerIndex,
          })
        ),
        map((val: { outerValue: Task; innerValue: string; outerIndex: number; innerIndex: number }) => {
          val.outerValue.shoperConnectionTokenID = val.innerValue;
          this.logger.debug(`Pobrany token połączenia: ${val.innerValue}`);
          return val.outerValue;
        }),
        catchError((err) => {
          this.logger.error(`Napotkano błąd podczas ustawiania tokena połączenia: `, err, taskToUpdate);
          return throwError(err);
        })
      );
    };
  }

  getToken(refresh = false): Observable<string> {
    return ShoperGetToken.getToken(this.config.shoperConfig.userToken, refresh, this.config.shoperConfig.delayTimeInMilisec, this.config.shoperConfig.maxRetryAttempts);
  }

  doneTask$: Observable<Task> = this.doingTask$.pipe(
    mergeMap((task: Task) =>
      iif(
        () => this.itShouldRetryTask(task) && task.error.errorType !== ErrorType.ITEM_NOT_FOUND_IN_SHOPER,
        of(task).pipe(
          tap((task: Task) => {
            this.errorStream$.next(task);
          })
        ),
        of(task).pipe(
          mergeMap((task: Task) =>
            iif(
              () => task.status === TaskShoperRequestStatusValue.error,
              of(task).pipe(
                tap((request: Task) => this.logger.error(`Nie udało się wykonać zadania o id ${request.id}.`)),
                tap((task: Task) => {
                  if (
                    task.error &&
                    this.config.emailNoticication.sendNotificationToErrorTypes.length > 0 &&
                    (this.config.emailNoticication.sendNotificationToErrorTypes.find((type: string) => task.error.errorType === type) || typeof task.error.errorType === "undefined")
                  ) {
                    this.sendEmailWithErrorMessage(task);
                  }
                })
              ),
              of(task).pipe(setStatus(TaskShoperRequestStatusValue.done))
            )
          )
        )
      )
    ),
    filter((task: Task) => !this.itShouldRetryTask(task) || (task.error && task.error.errorType === ErrorType.ITEM_NOT_FOUND_IN_SHOPER)),
    this.endTask(),
    setEndTime(),
    tap((request: Task) => this.logger.debug(`Zakończono pracę przy zadaniu o id ${request.id}, czas zakończenia pracy ${new Date(request.endTime).toLocaleTimeString()}.`)),
    tap((request: Task) => this.connectionPoolIsFree$.next()),
    catchError((err) => {
      this.logger.error(`Napotkano błąd podczas próby wykonania zadania.`, err);
      const message = `Podczas próby aktualizacji danych w systemie Shoper, napotkano błąd. Prawdopodobnie dane który miały zostać zaktualizowane nie zostały przesłane na serwer.
      Napotkany błąd spowodował zakończenie strumienia. Niezbędny jest restart serwisu oraz ręczna aktualizacja danych w systemie shoper!. Treść błędu: ${JSON.stringify(err)}`;
      const messageHtml = `<h2>Błąd</h2>
      <h3>Podczas próby aktualizacji danych w systemie Shoper, napotkano błąd!</h3>
      <p>Prawdopodobnie dane który miały zostać zaktualizowane nie zostały przesłane na serwer.</p>
      <p style="color: red">Prosimy o ręczną aktualizację!</p>
      <p style="color: red">Napotkany błąd spowodował zakończenie strumienia. Niezbędny jest restart serwisu!</p>
      <br />
      <p>Treść błędu: ${JSON.stringify(err)}</p>
      `;
      this.eMail.sendMail(`🔥🔥 Wstrzymano działanie strumienia!`, message, messageHtml, this.config.emailNoticication.adminsNotifications);
      return throwError(err);
    }),
    finalize(() => {
      this.logger.error("Strumień zakończył pracę");
      const message = `Serwer wstrzymał pracę - potrzebny jest restart`;
      const messageHtml = `<h2 style="color: red">Błąd krytyczny</h2>
        <h3>Serwer wstrzymał pracę - potrzebny jest restart!</h3>
      `;
      this.eMail.sendMail(`🔥🔥🔥 Serwer wstrzymał pracę - potrzebny jest restart!`, message, messageHtml, this.config.emailNoticication.adminsNotifications);
    })
  );

  endTask(): OperatorFunction<Task, Task> {
    return (source: Observable<Task>) =>
      source.pipe(
        delay(Config.getInstance().shoperConfig.delayTimeInMilisec),
        tap((request: Task) => this.logger.info(`Zakończono zadanie o id ${request.id}. Status: ${request.status}`))
      );
  }

  isNotEndingStreamError(data: any): boolean {
    return data.status && data.status === TaskShoperRequestStatusValue.error && data.error.errorType !== ErrorType.ITEM_NOT_FOUND_IN_SHOPER;
  }

  itShouldRetryTask(task: any): boolean {
    return !!(task.status && task.status === TaskShoperRequestStatusValue.error && task.attemptCounter < this.config.shoperConfig.maxRetryAttempts);
  }

  sendEmailWithErrorMessage(task: Task): void {
    this.logger.debug("Próba wysłania maila");

    const message = `Podczas próby aktualizacji danych w systemie Shoper dla towaru o symbolu ${
      task.filonMerchandise.product_code
    }, napotkano błąd. Prawdopodobnie dane który miały zostać zakutalizowane nie zostały przesłane na serwer. Prosimy o ręczną aktualizację ponieważ dane które są w systemie shoper nie będą odpowiadały prawdzie. Z programu Filon otrzymano dane(kod, ilość, cena, cenaE): ${
      task.filonMerchandise.product_code
    } | ${task.filonMerchandise.stock} | ${task.filonMerchandise.price} | ${task.filonMerchandise.priceE} | ${task.filonMerchandise.other_price}. Dane na temat towaru przekazane przez system shoper: ${JSON.stringify(task)}. Treść błędu: ${
      task["message"]
    }`;

    const messageHtml = `<h2>Błąd</h2>
        <h3>Podczas próby aktualizacji towaru o symbolu ${task.filonMerchandise.product_code}, napotkano błąd!</h3>
        <p>Prawdopodobnie dane który miały zostać zaktualizowane nie zostały przesłane na serwer.</p>
        <p style="color: red">Prosimy o ręczną aktualizację!</p>
        <p style="">Z programu Filon otrzymano dane: <pre>
        <code>${JSON.stringify(task.filonMerchandise, null, 4)}</code></pre></p>
        <p>Dane na temat towaru przekazane przez system shoper: <pre><code>${JSON.stringify(task.shoperStock)}</code></pre></p>
        <p>Treść błędu: ${task.error && task.error.message ? JSON.stringify(task.error.message) : JSON.stringify(task.error)}</p>
        <br />
        <p><i>Zadanie przekazane do systemu: </i><pre><code>${JSON.stringify(task)}</code></pre></p>
      `;
    this.eMail.sendMail(`StanyMagazynowe - 🔥Nie można ukończyć zadania aktualizacji danych dla towaru ${task.filonMerchandise.product_code}`, message, messageHtml, this.config.emailNoticication.alerts);
  }
}
