import { getLogger, Logger } from "log4js";
import { BehaviorSubject, Observable, OperatorFunction, Subject, throwError, zip } from "rxjs";
import { catchError, delay, map, share, switchMap, tap, retryWhen } from "rxjs/operators";
import { Config } from "../config/config";
import { FilonMerchandise } from "../models/filon-merchandise";
import { Task } from "../models/task";
import { TaskShoperRequestStatusValue } from "../models/task-shoper-request-status-value";
import { ShoperGetToken } from "./shoper-get-token";
import { createTaskRequest } from "./utils/create-task-request";
import { setEndTime } from "./utils/set-end-time";
import { setStatus } from "./utils/set-status";
import { retryStrategy } from "./utils/retry-strategy";

export class ShoperService {
  logger: Logger;
  filonMerchandiseAdd$: Subject<FilonMerchandise> = new Subject();
  connectionPoolIsFree$: Subject<void> = new BehaviorSubject(null);

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

  doingTask$: Observable<Task> = zip(this._taskRequest$, this.connectionPoolIsFree$).pipe(
    map(([s, f]) => s),
    setStatus(TaskShoperRequestStatusValue.making),
    this.setConnectionToken()
  );

  setConnectionToken(): OperatorFunction<Task, Task> {
    return (source: Observable<Task>) =>
      source.pipe(
        switchMap(
          (task: Task) => ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, false),
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
        })
      );
  }

  doneTask$: Observable<Task> = this.doingTask$.pipe(
    this.endTask(),
    setStatus(TaskShoperRequestStatusValue.done),
    setEndTime(),
    tap((request: Task) => this.logger.info(`Wykonano zadanie o id ${request.id} i czasie ${request.endTime}`)),
    tap((request: Task) => this.connectionPoolIsFree$.next())
  );

  endTask(): OperatorFunction<Task, Task> {
    return (source: Observable<Task>) =>
      source.pipe(
        delay(this.config.shoperConfig.delayTimeInMilisec),
        tap((request: Task) => this.logger.info(`Wykonano zadanie o id ${request.id}`))
      );
  }
}
