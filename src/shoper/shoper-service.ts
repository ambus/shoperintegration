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

export class ShoperService {
  logger: Logger;
  filonMerchandiseAdd$: Subject<FilonMerchandise> = new Subject();
  connectionPoolIsFree$: Subject<void> = new BehaviorSubject(null);
  errorStream$: Subject<Task> = new Subject<Task>();

  constructor(public config: Config) {
    this.logger = getLogger("ShoperService");
  }

  addTask(filonMerchandise: FilonMerchandise): void {
    this.filonMerchandiseAdd$.next(filonMerchandise);
  }

  _taskRequest$: Observable<Task> = this.filonMerchandiseAdd$.pipe(
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
        //TODO pobieranie danych z shopera
        //TODO porównywanie danych shoper - dane lokalne
        //TODO w przypadku potrzeby aktualizacji danych w shoperze wywołać zapisanie danych
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
      return source.pipe(
        tap((task: Task) => (taskToUpdate = task)),
        switchMap(
          (task: Task) =>
          this.getToken(),
          (outerValue, innerValue, outerIndex, innerIndex) => ({
            outerValue,
            innerValue,
            outerIndex,
            innerIndex
          })
        ),
        map((val: { outerValue: Task; innerValue: string; outerIndex: number; innerIndex: number }) => {
          val.outerValue.shoperConnectionTokenID = val.innerValue;
          return val.outerValue;
        }),
        catchError(err => {
          this.logger.error(`Napotkano błąd podczas ustawiania tokena połączenia: `, err, taskToUpdate);
          return throwError(new ErrorTask(taskToUpdate, err));
        })
      );
    };
  }

  getToken(): Observable<string>{
    return ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, false, Config.getInstance().shoperConfig.delayTimeInMilisec, Config.getInstance().shoperConfig.maxRetryAttempts)
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
                tap((request: Task) => this.logger.error(`Nie udało się wykonać zadania o id ${request.id}.`))
                //TODO wysłać @
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
      //TODO wysłać @
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
