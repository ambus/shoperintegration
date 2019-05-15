import { getLogger, Logger } from "log4js";
import { Observable, OperatorFunction, throwError } from "rxjs";
import { ajax, AjaxResponse } from "rxjs/ajax";
import { catchError, map, retryWhen, switchMap, tap } from "rxjs/operators";
import { XMLHttpRequest } from 'xmlhttprequest';
import { Config } from "../../config/config";
import { ErrorTask } from "../../models/error-task";
import { ShoperStock } from "../../models/shoper-stock";
import { Task } from "../../models/task";
import { retryStrategy } from "../utils/retry-strategy";

export class ShoperStockService {
  config: Config;
  logger: Logger;

  constructor(config: Config) {
    this.config = config;
    this.logger = getLogger("ShoperStockService");
  }

  getStock(userToken: string, itemCode: string): Observable<ShoperStock> {
    return this._getAjaxStocks(userToken, itemCode).pipe(
      map((res: AjaxResponse) => res.response.list[0] as ShoperStock),
      retryWhen(
        retryStrategy({
          maxRetryAttempts: this.config.shoperConfig.maxRetryAttempts,
          scalingDuration: this.config.shoperConfig.delayTimeInMilisec
        })
      )
    );
  }

  _getAjaxStocks(userToken: string, itemCode: string): Observable<AjaxResponse> {
    let createXHR = function() {
      return new XMLHttpRequest();
    };
    let url = `${this.config.shoperConfig.urls.productStocks}?filters={"code":"${itemCode}"}`;
    return ajax({ createXHR, url: url, crossDomain: true, withCredentials: false, method: "GET", headers: { Authorization: `Bearer ${userToken}` } });
  }

  setShoperStock(): OperatorFunction<Task, Task> {
    return (source: Observable<Task>) => {
      let taskToUpdate: Task;
      return source.pipe(
        tap((task: Task) => (taskToUpdate = task)),
        switchMap(
          (task: Task) => this.getStock(task.shoperConnectionTokenID, task.filonMerchandise.product_code),
          (outerValue, innerValue, outerIndex, innerIndex) => ({
            outerValue,
            innerValue,
            outerIndex,
            innerIndex
          })
        ),
        map((val: { outerValue: Task; innerValue: ShoperStock; outerIndex: number; innerIndex: number }) => {
          val.outerValue.shoperStock = val.innerValue;
          this.logger.debug(`Pobrano dane shoperStock`, val.innerValue, 'dla taska:', val.outerValue);
          return val.outerValue;
        }),
        catchError((err: any, caught: Observable<Task>) => {
          this.logger.error(`Napotkano błąd podczas pobierania informacji - stock: `, err, taskToUpdate);
          return throwError(new ErrorTask(taskToUpdate || err, err));
        })
      );
    };
  }
}