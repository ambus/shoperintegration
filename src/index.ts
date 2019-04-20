import { configure, getLogger, Logger } from "log4js";
import { Config } from "./config/config";
import { FileWatcher } from "./file-watcher/file-watcher";
import { retryWhen, tap, delayWhen } from "rxjs/operators";
import { timer } from "rxjs";

const CONFIG_FILE_NAME = "config.json";

export class Index {
  logger: Logger;
  config: Config;
  fw: FileWatcher;
  constructor(configFileName: string) {
    this.init(configFileName);
  }

  init(configFileName: string): void {
    this.config = Config.getInstance(configFileName);
    configure(this.config.log4js);
    this.logger = getLogger("index");
    this.logger.debug("Start serwisu shoperintergration");
    this.startWatchFile();
  }

  startWatchFile(): void {
    this.fw = new FileWatcher();
    this.fw.startWatch(this.config.fileInfo.path, this.config.fileInfo.fileName, true).pipe(
      tap(val => this.logger.debug("Nowe dane w strumieniu", val))
      // retryWhen(errors =>
      //   errors.pipe(
      //     tap(val =>
      //       this.logger.error(
      //         "Otrzymano błąd z fileWatchera. Po określonym czasię powinna nastąpić kolejna próba połączenia. W przypadku powtarzania się błędu należy skontaktować się z administratorem."
      //       )
      //     ),
      //     //TODO informacja o błędach powinna zostać wysłana na @
      //     delayWhen(val => timer(this.config.errorDelayTime))
      //   )
      // )
    )
    .subscribe((data: string) => {
      //TODO podpiąć czytanie danych
    },
    err => {});
  }
}
