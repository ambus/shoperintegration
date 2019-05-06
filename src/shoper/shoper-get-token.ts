import { Observable } from "rxjs";
import { ajax, AjaxResponse } from "rxjs/ajax";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { map, retryWhen, tap } from "rxjs/operators";
import { XMLHttpRequest } from "xmlhttprequest";

export class ShoperGetToken {
  static authorizationToken: string;

  static getToken(userToken: string, refreshToken: boolean, delayTimeInMilisec: number = 1000, maxRetryAttempts: number = 3): Observable<string> {
    if (refreshToken || !this.authorizationToken) {
      return this._getAjaxConnection(userToken, refreshToken).pipe(
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

  static _getAjaxConnection(userToken: string, refreshToken: boolean): Observable<AjaxResponse> {
    let createXHR = function() {
      return new XMLHttpRequest();
    };
    return ajax({ createXHR, url: Config.getInstance().shoperConfig.urls.token, crossDomain: true, withCredentials: false, method: "POST", headers: { Authorization: `Basic ${userToken}` } });
  }
}
