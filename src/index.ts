import { configure, getLogger, Logger } from "log4js";
import { iif, of, throwError } from "rxjs";
import { concatMap, delay, retryWhen, tap } from "rxjs/operators";
import { Config } from "./config/config";
import { parseCSVDataStream } from "./csv-parser/csv-parser";
import { FileWatcher } from "./file-watcher/file-watcher";
import { FilonMerchandise } from "./models/filon-merchandise";
import { replaceCommaInPrice } from "./replace-comma/replace-comma";
import { ShoperService } from "./shoper/shoper-service";

const CONFIG_FILE_NAME = "config.json";

export class Index {
  logger: Logger;
  config: Config;
  fw: FileWatcher = new FileWatcher();
  readFileOnStart: boolean = true;
  shoperService: ShoperService;

  constructor(configFileName: string) {
    this.init(configFileName);
    this.fw = new FileWatcher();
    this.shoperService = new ShoperService(this.config);
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
        this.retryPipeline,
        parseCSVDataStream(this.config.parserOptions),
        replaceCommaInPrice(),
      )
      .subscribe(
        (filonMerchandises: FilonMerchandise[]) => {
          filonMerchandises.forEach((filonItems: FilonMerchandise) => {
            this.shoperService.addTask(filonItems);
          });
        },
        err => {}
      );
  }
}

new Index(CONFIG_FILE_NAME).startWatchFile();
