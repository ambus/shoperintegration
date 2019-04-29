import { Config } from "../config/config";
import { FilonMerchandise } from "../models/filon-merchandise";
import { Task } from "../models/task";
import { Subject, Observable, OperatorFunction, of, merge, zip } from "rxjs";
import { map, share, delay, tap, switchMap, mapTo, scan, startWith } from "rxjs/operators";
import { createTaskRequest } from "./utils/create-task-request";
import { setStatus } from "./utils/set-status";
import { TaskShoperRequestStatusValue } from "../models/task-shoper-request-status-value";

export class ShoperService {
  constructor(private config: Config) {
    for (let index = 0; index < config.shoperConfig.countOfTaskMakers; index++) {
      this.taskMakerCheckIn$.next();
    }
  }

  filonMerchandiseAdd$: Subject<FilonMerchandise> = new Subject();
  taskMakerCheckIn$: Subject<void> = new Subject();

  _taskMaker$ = of(null).pipe(
  );

  _taskRequest$: Observable<Task> = this.filonMerchandiseAdd$.pipe(
    map(createTaskRequest),
    share()
  );

  makingTask$: Observable<Task> = this._taskRequest$.pipe(this.assignTaskMaker());

  addTask(filonMerchandise: FilonMerchandise): void {
    this.filonMerchandiseAdd$.next(filonMerchandise);
  }

  assignTaskMaker(): OperatorFunction<Task, Task> {
    return (source: Observable<Task>) =>
      zip(source, this._taskMaker$).pipe(
        map(([s]) => s),
        delay(800),
        setStatus(TaskShoperRequestStatusValue.making)
      );
  }

}
