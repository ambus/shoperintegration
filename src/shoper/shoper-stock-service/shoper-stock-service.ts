import { Config } from "../../config/config";
import { Observable, OperatorFunction, throwError } from "rxjs";
import { ShoperStock } from "../../models/shoper-stock";
import { AjaxResponse, ajax } from "rxjs/ajax";
import { map, tap, retryWhen, switchMap, catchError } from "rxjs/operators";
import { retryStrategy } from "../utils/retry-strategy";
import { ShoperReturnList } from "../../models/shoper-return-list";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { Task } from "../../models/task";
import { shoperStockMockup } from "../../../test/mockup/shoper-stock.mockup";
import { ErrorTask } from "../../models/error-task";
import { Logger, getLogger } from "log4js";

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
    return ajax({ createXHR, url: url, crossDomain: true, withCredentials: false, method: "POST", headers: { Authorization: `Basic ${userToken}` } });
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
          return val.outerValue;
        }),
        catchError((err: any, caught: Observable<Task>) => {
          this.logger.error(`Napotkano błąd podczas ustawiania tokena połączenia: `, err, taskToUpdate);
          return throwError(new ErrorTask(taskToUpdate, err));
        })
      );
    };
  }
}
