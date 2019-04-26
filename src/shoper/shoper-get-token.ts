import { Observable } from "rxjs";
import { ajax, AjaxResponse } from "rxjs/ajax";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { Config } from "../config/config";
import { tap, map } from "rxjs/operators";
import { XMLHttpRequest } from "xmlhttprequest";

export class ShoperGetToken {
  public static authorizationToken: string;

  public static getToken(userToken: string, refreshToken: boolean): Observable<string> {
    let createXHR = new XMLHttpRequest();
    if (refreshToken || !this.authorizationToken) {
      return ajax({ createXHR, url: Config.getInstance().shoperConfig.urls.token, crossDomain: true, withCredentials: false, method: "POST", headers: { Authorization: `Basic ${userToken}` } }).pipe(
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
