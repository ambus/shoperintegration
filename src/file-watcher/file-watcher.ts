import { getLogger, Logger } from "log4js";
import { Observable, Subject, pipe, EMPTY, Subscription } from "rxjs";
import { tap, retry, catchError, retryWhen } from "rxjs/operators";
import * as fs from "fs";
import { watch, FSWatcher } from "chokidar";
import { Config } from "../config/config";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { EMail } from "../mail/email";
import { retryStrategy } from "../shoper/utils/retry-strategy";
import { runInThisContext } from "vm";

export class FileWatcher {
  public logger: Logger;
  private config: Config;
  private eMail: EMail;
  private watcher: FSWatcher;
  private readFileStream: Subscription;
  private watchFileStream: Subscription;

  constructor(config: Config) {
    this.logger = getLogger("fileWatcher");
    this.config = config;
    this.eMail = new EMail(this.config);
  }

  public startWatch(filePath: string, fileName: string, readOnStart: boolean): Observable<string> {
    return Observable.create((observer: AnonymousSubject<string>) => {
      this.logger.debug(`Start obserwowania pliku ${filePath}/${fileName}`);
      try {
        if (readOnStart) {
          this.readFileAndSendThemToStream(`${filePath}/${fileName}`, observer, false);
        }
        this.watchFileStream = this.watchFile(filePath)
          .pipe(tap((val) => this.logger.info("Watcher zaobserwował zmiany w podanym katalogu", val)))
          .subscribe((path: string) => {
            if (this.changesHaveOccurredInTheObservableFile(path, `${filePath}/${fileName}`)) this.readFileAndSendThemToStream(path, observer);
          });
      } catch (err) {
        this.logger.error(`Napotkano błąd podczas odczytu pliku ${filePath}${fileName}. Wymagane jest ponowne uruchomienie strumienia`, err);
        observer.error(err);
      }
    });
  }

  public readFileAndSendThemToStream(filePath: string, stream: Subject<string>, sendEmail: boolean = true): void {
    this.readFileStream = this.readFile(filePath)
      .pipe(
        tap((val) => this.logger.info("Odczytano nowe dane")),
        retryWhen(
          retryStrategy({
            maxRetryAttempts: 50,
            scalingDuration: 500,
          })
        ),
        tap(() => this.deleteFile(filePath))
      )
      .subscribe(
        (res: string) => stream.next(res),
        (err: string) => {
          this.logger.error(`Błąd podczas odczytu pliku ${filePath}`, err);
          if (sendEmail && !err.includes("resource busy or locked")) {
            let message = `Podczas próby odczyty pliku ${filePath}, napotkano błąd. Treść błędu: ${err}`;
            let messageHtml = `<h2>Błąd</h2>
            <h3>Błąd podczas odczytu pliku ${filePath}, napotkano błąd!</h3>
            <p style="">Treść błędu 
            <pre><code>${err}</code></pre>
            </p>
            <br />
            `;
            this.eMail.sendMail(`🔥Nie można odczytać pliku ${filePath}`, message, messageHtml, this.config.emailNoticication.alerts);
          }
          stream.next('');
        }
      );
  }

  public readFile(filePath: string): Observable<string> {
    return Observable.create((observer: AnonymousSubject<string>) => {
      new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            fs.readFile(filePath, this.config.encoding, (err: any, data: string) => {
              if (err) {
                this.logger.error(`Napotkano błąd podczas próby odczytu pliku ${filePath}:`, err);
                if(err?.code === 'ENOENT') {
                  observer.next('');
                  observer.complete();
                } else {
                  observer.error(err);
                  observer.complete();
                }
              } else {
                this.logger.info(`Odczytano nowe dane:`, data);
                observer.next(data);
                observer.complete();
              }
            });
          } catch (err) {
            observer.error(err);
            observer.complete();
          }
        }, this.config.timeout || 100);
      });
    });
  }

  public deleteFile(filepath: string): void {
    try {
      this.logger.warn(`Usuwanie pliku ${filepath}`);
      fs.unlinkSync(filepath);
    } catch (err) {
      this.logger.error(`Napotkano błąd podczas próby usunięcia pliku ${filepath}:`, err);
    }
  }

  public watchFile(pathToWatch: string): Subject<string> {
    this.logger.debug(`Start obserwowania katalogu ${pathToWatch}`);
    const sub = new Subject<string>();
    this.watcher = watch(`${pathToWatch}`, {
      persistent: true,
      usePolling: true,
    })
      .on("add", (path: string) => sub.next(path))
      .on("change", (path: string) => sub.next(path));
    return sub;
  }

  public changesHaveOccurredInTheObservableFile(path: string, filePathToWatch: string): boolean {
    return !!(path.toLowerCase() === `${filePathToWatch}`.toLowerCase());
  }

  public close(): void {
    this.watcher && this.watcher.close();
    this.readFileStream && this.readFileStream.unsubscribe();
    this.watchFileStream && this.watchFileStream.unsubscribe();
  }
}
