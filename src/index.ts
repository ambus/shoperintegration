import { configure, getLogger, Logger } from "log4js";
import { Config } from "./config/config";
import { FileWatcher } from "./file-watcher/file-watcher";
import { retryWhen, tap, delayWhen, mergeMap, concatMap, delay } from "rxjs/operators";
import { timer, Observable, iif, throwError, of } from "rxjs";
import { FilonMerchandise } from "./models/filon-merchandise";

const CONFIG_FILE_NAME = "config.json";

export class Index {
  logger: Logger;
  config: Config;
  fw: FileWatcher = new FileWatcher();
  readFileOnStart: boolean = true;

  constructor(configFileName: string) {
    this.init(configFileName);
    this.fw = new FileWatcher();
  }

  init(configFileName: string): void {
    this.config = Config.getInstance(configFileName);
    configure(this.config.log4js);
    this.logger = getLogger("index");
    this.logger.debug("Start serwisu shoperintergration");
  }

  retryPipeline = retryWhen(errors =>
    errors.pipe(
      concatMap((e, i) =>
        iif(
          () => i > this.config.attempsWhenError,
          throwError(e),
          of(e).pipe(
            tap(val => (this.readFileOnStart = false)),
            delay(this.config.errorDelayTime)
          )
        )
      )
    )
  );

  startWatchFile(): void {
    this.fw
      .startWatch(this.config.fileInfo.path, this.config.fileInfo.fileName, this.readFileOnStart)
      .pipe(
        tap(val => this.logger.debug("Nowe dane w strumieniu", val)),
        this.retryPipeline
      )
      .subscribe(
        (data: string) => {
          try {
            let parsedData = this.parseData(data);
            this.sendDataToShoper(parsedData);
          } catch (err) {}
        },
        err => {}
      );
  }
  parseData(data: string): FilonMerchandise[] {
    // console.warn("TODO parse string to javascript opbject");

    return undefined;
  }
  sendDataToShoper(filonMerchandises: FilonMerchandise[]): void {
    console.warn("TODO send parsed data do shoper");
  }
}

// new Index(CONFIG_FILE_NAME).startWatchFile();