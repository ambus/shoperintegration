import { getLogger, Logger } from "log4js";
import { BehaviorSubject, Observable, OperatorFunction, Subject, zip } from "rxjs";
import { delay, map, share, tap } from "rxjs/operators";
import { Config } from "../config/config";
import { FilonMerchandise } from "../models/filon-merchandise";
import { Task } from "../models/task";
import { TaskShoperRequestStatusValue } from "../models/task-shoper-request-status-value";
import { createTaskRequest } from "./utils/create-task-request";
import { setStatus } from "./utils/set-status";
import { setEndTime } from "./utils/set-end-time";

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
    share()
    // this.makeTask()
  );
  doneTask$: Observable<Task> = this.doingTask$.pipe(
    this.endTask(),
    setStatus(TaskShoperRequestStatusValue.done),
    setEndTime(),
    tap((request: Task) => this.logger.info(`Wykonano zadanie o id ${request.id} i czasie ${request.endTime}`)),
    tap((request: Task) => this.connectionPoolIsFree$.next()),
    share()
  );

  endTask(): OperatorFunction<Task, Task> {
    return (source: Observable<Task>) =>
      source.pipe(
        delay(this.config.shoperConfig.delayTimeInMilisec),
        tap((request: Task) => this.logger.info(`Wykonano zadanie o id ${request.id}`))
      );
  }
}
