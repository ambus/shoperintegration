import { Config } from "../config/config";
import { FilonMerchandise } from "../models/filon-merchandise";
import { Task } from "../models/task";
import { Subject, Observable } from "rxjs";
import { map, share } from "rxjs/operators";
import { createTaskRequest } from "./utils/create-task-request";

export class ShoperService {
    filonMerchandiseAdd$: Subject<FilonMerchandise> = new Subject();

    _taskStock$: Observable<Task> = this.filonMerchandiseAdd$.pipe(
        map(createTaskRequest),
        share()
    )

    constructor(private conifg: Config) {
    }

    addTask(filonMerchandise: FilonMerchandise): void {
        this.filonMerchandiseAdd$.next(filonMerchandise);
    }
}
