import { configure, getLogger, Logger } from "log4js";
import { iif, of, throwError } from "rxjs";
import { concatMap, delay, retryWhen, tap } from "rxjs/operators";
import { Config } from "./config/config";
import { parseCSVDataStream } from "./csv-parser/csv-parser";
import { FileWatcher } from "./file-watcher/file-watcher";
import { FilonMerchandise } from "./models/filon-merchandise";
import { replaceCommaInPrice } from "./replace-comma/replace-comma";
import { ShoperService } from "./shoper/shoper-service";
import { EMail } from "./mail/email";
import { Backup } from "./backup/backup";
import { replaceNotSupportedSight } from "./replace-notsupported-sight/replace-notsupported-sight";

const CONFIG_FILE_NAME = "config.json";

export class Index {
  logger: Logger;
  config: Config;
  fw: FileWatcher;
  readFileOnStart: boolean = true;
  shoperService: ShoperService;
  eMail: EMail;
  backup: Backup;

  constructor(configFileName: string) {
    this.init(configFileName);
    this.fw = new FileWatcher(this.config);
    this.shoperService = new ShoperService(this.config);
    this.shoperService.doneTask$.subscribe(task => {
      this.logger.info("Zakończono wykonywanie taska", task);
    });
    this.backup = new Backup(this.config);
    this.eMail = new EMail(this.config);
    let message = `Właśnie został ponownie uruchomiony serwis shoperintegrations. W razie pytań prosimy o kontakt z administratorem ${this.config.emailNoticicationList.adminsNotifications}`;
    let messageHtml = `<h3>Właśnie został ponownie uruchomiony serwis shoperintegrations.</h3> <p>W razie pytań prosimy o kontakt z administratorem 👨🏽‍💻 ${
      this.config.emailNoticicationList.adminsNotifications
    }</p><b>Życzymy miłego dnia 😀</b>`;
    this.eMail.sendMail(`🎉 Nastąpił restart systemu shoperingegration`, message, messageHtml, this.config.emailNoticicationList.alerts);
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
          () => i >= this.config.attempsWhenError,
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
        this.backup.addNewFilonData(),
        this.retryPipeline,
        parseCSVDataStream(this.config.parserOptions),
        replaceCommaInPrice()
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
