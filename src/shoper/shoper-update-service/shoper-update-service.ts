import { Config } from "../../config/config";
import { Logger, getLogger } from "log4js";
import { Observable, OperatorFunction, throwError } from "rxjs";
import { AjaxResponse, ajax } from "rxjs/ajax";
import { Task } from "../../models/task";
import { map, retryWhen, tap, switchMap, catchError } from "rxjs/operators";
import { retryStrategy } from "../utils/retry-strategy";
import { ErrorTask } from "../../models/error-task";
import { TaskShoperRequestStatusValue } from "../../models/task-shoper-request-status-value";

export class ShoperUpdateService {
  config: Config;
  logger: Logger;

  constructor(config: Config) {
    this.config = config;
    this.logger = getLogger("ShoperUpdateService");
  }

  updateStock(userToken: string, task: Task): Observable<number> {
    return this._pushAjaxShoperUpdate(userToken, task).pipe(
      map((res: AjaxResponse) => res.response as number),
      retryWhen(
        retryStrategy({
          maxRetryAttempts: this.config.shoperConfig.maxRetryAttempts,
          scalingDuration: this.config.shoperConfig.delayTimeInMilisec
        })
      )
    );
  }

  _pushAjaxShoperUpdate(userToken: string, task: Task): Observable<AjaxResponse> {
    let createXHR = function() {
      return new XMLHttpRequest();
    };
    let url = `${this.config.shoperConfig.urls.productStocksUpdate}/${task.shoperStock.stock_id}`;
    return ajax({
      createXHR,
      url: url,
      crossDomain: true,
      withCredentials: false,
      method: "PUT",
      headers: { Authorization: `Basic ${userToken}`, "Content-Type": "application/json" },
      body: task.stockToUpdate || {}
    });
  }

  updateShoperStock(): OperatorFunction<Task, Task> {
    return (source: Observable<Task>) => {
      let taskToUpdate: Task;
      return source.pipe(
        tap((task: Task) => (taskToUpdate = task)),
        switchMap(
          (task: Task) => this.updateStock(task.shoperConnectionTokenID, task),
          (outerValue, innerValue, outerIndex, innerIndex) => ({
            outerValue,
            innerValue,
            outerIndex,
            innerIndex
          })
        ),
        map((val: { outerValue: Task; innerValue: number; outerIndex: number; innerIndex: number }) => {
          this.logger.info(`Status aktualizacji towaru: ${val.innerValue}, Task: `, val.outerValue);
          val.outerValue.updateStatus = val.innerValue;
          return val.outerValue;
        }),
        catchError((err: any, caught: Observable<Task>) => {
          this.logger.error(`Napotkano błąd podczas aktualizacji towaru w bazie danych shopera: `, err, taskToUpdate);
          return throwError(new ErrorTask(taskToUpdate || err, err));
        })
      );
    };
  }
}
