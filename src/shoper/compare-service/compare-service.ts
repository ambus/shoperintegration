import { getLogger, Logger } from "log4js";
import { Observable, OperatorFunction, throwError } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { Task } from "../../models/task";

export class CompareService {
  logger: Logger;

  constructor() {
    this.logger = getLogger("CompareService");
  }

  generateItemToUpdate(): OperatorFunction<Task, Task> {
    return (source: Observable<Task>) => {
      let taskToUpdate: Task;
      return source.pipe(
        tap((task: Task) => (taskToUpdate = task)),
        map((task: Task) => {
          task.stockToUpdate = { stock: task.filonMerchandise.stock.toString(), warn_level: this.getWarnLevel(task.filonMerchandise.warnLevel, task.shoperStock.warn_level) };
          return task;
        }),
        catchError((err: any, caught: Observable<Task>) => {
          this.logger.error(`Napotkano błąd podczas generowania obiektu do aktualizacji w shoperze`, err, taskToUpdate);
          return throwError(err);
        })
      );
    };
  }

  getWarnLevel(warnLevel: number, oldWarnLevel: string): string {
    if(typeof warnLevel === "undefined") return oldWarnLevel;
    if (warnLevel <= 0) return "0";
    return Math.floor(warnLevel).toString();
  }
}
