import { getLogger, Logger } from "log4js";
import { Observable, Subject } from "rxjs";
import * as fs from "fs";
import { FSWatcher, watch } from "chokidar";

import { Config } from "../config/config";

export class FileWatcher {
  private watchingFile: string;
  public logger: Logger;
  private $dataFromFileStream: Subject<string>;
  private config: Config;
  private watcher: FSWatcher;

  constructor() {
    this.$dataFromFileStream = new Subject();
    this.logger = getLogger();
    this.config = Config.getInstance();
  }

  public get streamWithDataInsertedToWatchingFile(): Observable<string> {
    return this.$dataFromFileStream.asObservable();
  }

  public startWatch(filePath: string, fileName: string, readOnStart: boolean): void {
    this.logger.debug(`Start obserwowania pliku ${filePath}${fileName}`);
    try {
      if (readOnStart) {
        this.readFileAndSendThemToStream(`${filePath}${fileName}`);
      }
      this.watchFile(filePath, fileName);
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

  public readFileAndSendThemToStream(filePath: string): Promise<void> {
    this.logger.debug(`Próba odczytania pliku ${filePath}`);
    return new Promise(async (resolve, reject) => {
      try {
        if (fs.existsSync(filePath)) {
          let returnString = await this.readFile(filePath);
          await this.deleteFile(filePath);
          this.$dataFromFileStream.next(returnString);
        } else {
          this.logger.debug(`Plik ${filePath} nie istnieje`);
        }
        resolve();
      } catch (err) {
        this.logger.error(`Napotkano błąd podczas odczytu pliku ${filePath}`, err);
        reject(err);
      }
    });
  }

  public readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, this.config.encoding, (err: Error, data: string) => {
        if (err) {
          this.logger.error(`Napotkano błąd podczas próby odczytu pliku ${filePath}:`, err);
          reject(err);
        }
        this.logger.info(`Odczytano nowe dane:`, data);
        resolve(data);
      });
    });
  }

  public deleteFile(filepath: string): void {
    this.logger.warn(`Usuwanie pliku ${filepath}`);
    fs.unlinkSync(filepath);
  }

  public watchFile(pathToWatch: string, fileToWatch: string): void {
    this.logger.debug(`Start obserwowania katalogu ${pathToWatch}`);
    this.watcher = watch(`${pathToWatch}`, {
      persistent: true,
      usePolling: true
    });

    this.watcher.on("add", path => {
      this.logger.warn(`Został dodany plik ${path}`);
      if (path.toLowerCase() === `${pathToWatch}${fileToWatch}`.toLowerCase()) {
        try {
          this.readFileAndSendThemToStream(`${path}`);
        } catch (err) {
          this.logger.error(`Napotkano błąd podczas próby obserwowania pliku ${pathToWatch}${fileToWatch}`, err);
        }
      }
    });

    this.watcher.on("change", (path: string) => {
      this.logger.debug(`Nastąpiła zmiana w pliku ${path}`);
      if (path.toLowerCase() === `${pathToWatch}${fileToWatch}`.toLowerCase()) {
        try {
          this.readFileAndSendThemToStream(`${path}`);
        } catch (err) {
          this.logger.error(`Napotkano błąd podczas próby obserwowania pliku ${pathToWatch}${fileToWatch}`, err);
        }
      }
    });
  }
}
