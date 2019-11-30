import { getLogger, Logger } from "log4js";
import { Observable, of, OperatorFunction, throwError } from "rxjs";
import { ajax, AjaxResponse } from "rxjs/ajax";
import { catchError, map, retryWhen, switchMap, tap, timeout } from "rxjs/operators";
import { XMLHttpRequest } from "xmlhttprequest";
import { Config } from "../../config/config";
import { Task } from "../../models/task";
import { retryStrategy } from "../utils/retry-strategy";
import { ErrorType } from "../../models/error-type";
import { ErrorInTask } from "../../models/error-in-task";

export class ShoperUpdateService {
  config: Config;
  logger: Logger;

  constructor(config: Config) {
    this.config = config;
    this.logger = getLogger("ShoperUpdateService");
  }

  updateStock(userToken: string, task: Task): Observable<number> {
    return this._pushAjaxShoperUpdate(userToken, task).pipe(
      retryWhen(
        retryStrategy({
          maxRetryAttempts: this.config.shoperConfig.maxRetryAttempts,
          scalingDuration: this.config.shoperConfig.delayTimeInMilisec
        })
      ),
      timeout(this.config.errorDelayTime),
      catchError((err) => throwError(new ErrorInTask("Napotkano błąd podczas aktualizacji towaru w bazie shopera", err, ErrorType.UPDATE_ERROR))),
      map((res: AjaxResponse) => res.response as number),
    );
  }

  _pushAjaxShoperUpdate(userToken: string, task: Task): Observable<AjaxResponse> {
    let createXHR = function() {
      return new XMLHttpRequest();
    };
    if (task.shoperStock && task.shoperStock.stock_id) {
      let url = `${this.config.shoperConfig.urls.productStocks}/${task.shoperStock.stock_id}`;
      return ajax({
        createXHR,
        url: url,
        crossDomain: true,
        withCredentials: false,
        method: "PUT",
        headers: { Authorization: `Bearer ${userToken}`, "Content-Type": "application/json" },
        body: task.stockToUpdate || {}
      });
    } else {
      return throwError(new ErrorInTask("Towaru nie ma w bazie danych shopera", task, ErrorType.ITEM_NOT_FOUND_IN_SHOPER));
    }
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
          val.outerValue.updateStatus = val.innerValue;
          this.logger.info(`Status aktualizacji towaru: ${val.innerValue}, Task: `, val.outerValue);
          return val.outerValue;
        }),
        catchError((err: any, caught: Observable<Task>) => {
          this.logger.error(`Napotkano błąd podczas aktualizacji towaru w bazie danych shopera: `, err, taskToUpdate);
          return throwError(err);
        })
      );
    };
  }
}
