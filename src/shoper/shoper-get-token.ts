import { Observable } from "rxjs";
import { ajax } from 'rxjs/ajax';
import { AnonymousSubject } from "rxjs/internal/Subject";
import { Config } from "../config/config";


const fetch = require("node-fetch");

export class TokenService {
  private static instance: TokenService;
  public authorizationToken: AuthorizationToken;

  private constructor() {}

  static getInstance() {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  getUserAutorizationToken(refreshToken: boolean = false): Observable<AuthorizationToken> {
    if (this.authorizationToken && !refreshToken) {
      return Observable.create((observer: AnonymousSubject<string>) => {
        observer.next("World");
        observer.complete();
      });
    } else {
      return Observable.create((observer: AnonymousSubject<string>) => {
        observer.next(this.authorizationToken);
        observer.complete();
      });
    }
  }

  public updateAutorizationTokenFetch(): Promise<AuthorizationToken> {
    ajax(Config.getInstance().shoperConfig.urls.token)
  }
}
