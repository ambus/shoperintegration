import { getLogger, Logger } from "log4js";
import { Observable, OperatorFunction, throwError, iif, of } from "rxjs";
import { ajax, AjaxResponse } from "rxjs/ajax";
import { catchError, map, retryWhen, switchMap, tap, mergeMap, timeout } from "rxjs/operators";
import { XMLHttpRequest } from "xmlhttprequest";
import { Config } from "../../config/config";
import { ShoperStock } from "../../models/shoper-stock";
import { Task } from "../../models/task";
import { retryStrategy } from "../utils/retry-strategy";
import { ErrorType } from "../../models/error-type";
import { ErrorInTask } from "../../models/error-in-task";

export class ShoperStockService {
  config: Config;
  logger: Logger;

  constructor(config: Config) {
    this.config = config;
    this.logger = getLogger("ShoperStockService");
  }

  getStock(userToken: string, itemCode: string): Observable<ShoperStock> {
    return this._getAjaxStocks(userToken, itemCode).pipe(
      retryWhen(
        retryStrategy({
          maxRetryAttempts: this.config.shoperConfig.maxRetryAttempts,
          scalingDuration: this.config.shoperConfig.delayTimeInMilisec
        })
      ),
      timeout(this.config.errorDelayTime),
      mergeMap((res: AjaxResponse) =>
        iif(
          () => res.status !== 200 || (res.response.list && res.response.list.length === 0),
          throwError(
            res.status === 401
              ? new ErrorInTask("Brak autoryzacji!", res, ErrorType.UNAUTHORIZED_CLIENT)
              : new ErrorInTask("Towaru nie ma w bazie danych shopera", res, ErrorType.ITEM_NOT_FOUND_IN_SHOPER)
          ),
          of(res).pipe(map((res: AjaxResponse) => res.response.list[0] as ShoperStock))
        )
      )
    );
  }

  _getAjaxStocks(userToken: string, itemCode: string): Observable<AjaxResponse> {
    const createXHR = function() {
      return new XMLHttpRequest();
    };
    const url = `${this.config.shoperConfig.urls.productStocks}?filters={"code":"${itemCode}"}`;
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
          this.logger.debug(`Pobrano dane shoperStock`, val.innerValue, "dla taska:", val.outerValue);
          return val.outerValue;
        }),
        catchError((err: any, caught: Observable<Task>) => {
          this.logger.error(`Napotkano błąd podczas pobierania obiektu do aktualizacji w shoperze`, err, taskToUpdate);
          return throwError(err);
        })
      );
    };
  }
}
