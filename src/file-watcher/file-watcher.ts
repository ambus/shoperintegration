import { getLogger, Logger } from "log4js";
import { Observable, Subject, throwError } from "rxjs";
import { tap, retry, finalize } from "rxjs/operators";

import * as fs from "fs";
import { FSWatcher, watch } from "chokidar";

import { Config } from "../config/config";
import { AnonymousSubject } from "rxjs/internal/Subject";

export class FileWatcher {
  private watchingFile: string;
  public logger: Logger;
  private $dataFromFileStream: Subject<string>;
  private config: Config;

  constructor() {
    this.$dataFromFileStream = new Subject();
    this.logger = getLogger();
    this.config = Config.getInstance();
  }

  public get streamWithDataInsertedToWatchingFile(): Observable<string> {
    return this.$dataFromFileStream.asObservable();
  }

  public startWatch(filePath: string, fileName: string, readOnStart: boolean): void {
    this.logger.debug(`Start obserwowania pliku ${filePath}/${fileName}`);
    try {
      if (readOnStart) {
        this.readFileAndSendThemToStream(`${filePath}/${fileName}`, this.$dataFromFileStream);
      }
      this.watchFile(filePath)
        .pipe(tap(val => this.logger.info("Watcher zaobserwował zmiany w podanym katalogu", val)))
        .subscribe((path: string) => {
          if (this.changesHaveOccurredInTheObservableFile(path, `${filePath}/${fileName}`)) this.readFileAndSendThemToStream(`${filePath}/${fileName}`, this.$dataFromFileStream);
        });
      this.watchingFile = `${filePath}${fileName}`;
    } catch (err) {
      this.logger.error(`Napotkano błąd podczas odczytu pliku ${filePath}${fileName}. Wymagane jest ponowne uruchomienie obserwowania plików!`, err);
      this.watchingFile = undefined;
      throw err;
    }
  }

  public get isWatching(): boolean {
    return !!(this.watchingFile && this.watchingFile.length > 0);
  }

  public readFileAndSendThemToStream(filePath: string, stream: Subject<string>): void {
    this.readFile(filePath)
      .pipe(
        tap(val => this.logger.info("Odczytano nowe dane")),
        retry(5),
        tap(() => this.deleteFile(filePath))
      )
      .subscribe((res: string) => stream.next(res), (err: any) => this.logger.error(`Błąd podczas odczytu pliku ${filePath}`, err));
  }

  public readFile(filePath: string): Observable<string> {
    return Observable.create(
      function(observer: AnonymousSubject<string>) {
        fs.readFile(filePath, this.config.encoding, (err: Error, data: string) => {
          if (err) {
            this.logger.error(`Napotkano błąd podczas próby odczytu pliku ${filePath}:`, err);
            observer.error(err);
          }
          this.logger.info(`Odczytano nowe dane:`, data);
          observer.next(data);
          observer.complete();
        });
      }.bind(this)
    );
  }

  public deleteFile(filepath: string): void {
    this.logger.warn(`Usuwanie pliku ${filepath}`);
    fs.unlinkSync(filepath);
  }

  public watchFile(pathToWatch: string): Subject<string> {
    this.logger.debug(`Start obserwowania katalogu ${pathToWatch}`);
    const sub = new Subject<string>();
    watch(`${pathToWatch}`, {
      persistent: true,
      usePolling: true
    })
      .on("add", (path: string) => sub.next(path))
      .on("change", (path: string) => sub.next(path));
    return sub;
  }

  public changesHaveOccurredInTheObservableFile(path: string, filePathToWatch: string): boolean {
    return !!(path.toLowerCase() === `${filePathToWatch}`.toLowerCase());
  }
}
