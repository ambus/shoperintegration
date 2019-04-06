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
        // this.readFileAndSendThemToStream(`${filepath}`);
      }
      //   this.watchFile(filepath);
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
}
