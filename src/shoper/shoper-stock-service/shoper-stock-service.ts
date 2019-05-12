import { Config } from "../../config/config";
import { Observable } from "rxjs";
import { ShoperStock } from "../../models/shoper-stock";
import { AjaxResponse, ajax } from "rxjs/ajax";
import { map, tap, retryWhen } from "rxjs/operators";
import { retryStrategy } from "../utils/retry-strategy";
import { ShoperReturnList } from "../../models/shoper-return-list";
import { AnonymousSubject } from "rxjs/internal/Subject";

export class ShoperStockService {
  config: Config;
  constructor(config: Config) {
    this.config = config;
  }

  getStock(userToken: string, itemCode: string): Observable<ShoperStock> {
    return Observable.create((observer: AnonymousSubject<ShoperStock>) => {
      observer.next(undefined);
      observer.complete();
    })
    // return this._getAjaxStock(userToken, itemCode).pipe(
    //   map((res: AjaxResponse) => res.response as ShoperReturnList<ShoperStock>),
    //   retryWhen(
    //     retryStrategy({
    //       maxRetryAttempts: this.config.shoperConfig.maxRetryAttempts,
    //       scalingDuration: this.config.shoperConfig.delayTimeInMilisec
    //     })
    //   )
    // );
  }

  _getAjaxStock(userToken: string, itemCode: string): Observable<AjaxResponse> {
    let createXHR = function() {
      return new XMLHttpRequest();
    };
    let url = `${this.config.shoperConfig.urls.productStocks}?filters={"code":"${itemCode}"}`;
    return ajax({ createXHR, url: url, crossDomain: true, withCredentials: false, method: "POST", headers: { Authorization: `Basic ${userToken}` } });
  }
}
