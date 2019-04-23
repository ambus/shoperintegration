import { Observable, iif, throwError, of } from "rxjs";
import { ajax, AjaxResponse } from "rxjs/ajax";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { Config } from "../config/config";
import { retryWhen, concatMap, tap, delay, map } from "rxjs/operators";
import { XMLHttpRequest } from "xmlhttprequest";

export class ShoperGetToken {
  public static authorizationToken: string;

  public static retryPipeline = retryWhen(errors =>
    errors.pipe(concatMap((e, i) => iif(() => i > Config.getInstance().attempsWhenError, throwError(e), of(e).pipe(delay(Config.getInstance().errorDelayTime)))))
  );

  static createXHR() {
    return new XMLHttpRequest();
  }

  public static getToken(userToken: string, refreshToken: boolean = true): Observable<string> {
    function createXHR() {
      return new XMLHttpRequest();
    }
    if (refreshToken || !this.authorizationToken) {
      return ajax({ createXHR, url: Config.getInstance().shoperConfig.urls.token, crossDomain: true, withCredentials: false, method: "POST", headers: { Authorization: `Basic ${userToken}` } }).pipe(
        tap((token: AjaxResponse) => console.warn(token.response)),
        map((token: AjaxResponse) => token.response.access_token),
        tap((token: string) => (this.authorizationToken = token))
      );
    } else {
      return Observable.create((observer: AnonymousSubject<string>) => {
        observer.next(this.authorizationToken);
        observer.complete();
      });
    }
  }
}
