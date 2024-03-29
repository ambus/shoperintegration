import { Observable, throwError } from "rxjs";
import { ajax, AjaxResponse } from "rxjs/ajax";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { map, retryWhen, tap, catchError, timeout } from "rxjs/operators";
import { XMLHttpRequest } from "xmlhttprequest";
import { Config } from "../config/config";
import { retryStrategy } from "./utils/retry-strategy";
import { ErrorInTask } from "../models/error-in-task";
import { ErrorType } from "../models/error-type";
import { getLogger } from "log4js";

const logger = getLogger("ShoperGetToken");
export class ShoperGetToken {
  static authorizationToken: string;

  static getToken(userToken: string, refreshToken: boolean, delayTimeInMilisec = 1000, maxRetryAttempts = 3): Observable<string> {
    if (refreshToken || !this.authorizationToken) {
      return this._getAjaxConnection(userToken, refreshToken).pipe(
        tap(console.warn),
        map((token: AjaxResponse) => token.response.access_token),
        tap((token: string) => (this.authorizationToken = token)),
        retryWhen(
          retryStrategy({
            maxRetryAttempts: maxRetryAttempts,
            scalingDuration: delayTimeInMilisec,
          })
        ),
        catchError((err) => {
          return throwError(new ErrorInTask("Napotkano błąd podczas pobierania tokena uwierzytelniającego", err, ErrorType.TOKEN_GET));
        })
      );
    } else {
      return Observable.create((observer: AnonymousSubject<string>) => {
        observer.next(this.authorizationToken);
        observer.complete();
      });
    }
  }

  static _getAjaxConnection(userToken: string, refreshToken: boolean): Observable<AjaxResponse> {
    const createXHR = function () {
      return new XMLHttpRequest();
    };
    return ajax({
      createXHR,
      url: Config.getInstance().shoperConfig.urls.token,
      crossDomain: true,
      withCredentials: false,
      method: "POST",
      headers: { Authorization: `Basic ${userToken}` },
    });
  }
}
