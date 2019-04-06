import { getLogger, Logger } from "log4js";
import { Observable, Subject } from "rxjs";
import * as fs from "fs";
import { Config } from "../config/config";

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

  public startWatch(filepath: string, readOnStart: boolean): void {
    this.logger.debug(`Start obserwowania pliku ${filepath}`);
    try {
      if (readOnStart) {
        this.readFileAndSendThemToStream(`${filepath}`);
      }
      this.watchFile(filepath);
      this.watchingFile = filepath;
    } catch (err) {
      this.logger.error(`Napotkano błąd podczas odczytu pliku ${filepath}. Wymagane jest ponowne uruchomienie obserwowania plików!`, err);
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
        this.logger.error(`Napotkano błąd podczas próby odczytu pliku ${filePath}`, err);
        throw err;
      }
    });
  }

  public readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, this.config.encoding, (err: Error, data: string) => {
        if (err) {
          this.logger.error(`Napotkano błąd podczas próby odczytu pliku ${filePath}:`, err);
          throw err;
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
}
