import { configure, getLogger, Logger } from "log4js";
import { iif, of, throwError, Subscription } from "rxjs";
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
import { ShoperGetToken } from "./shoper/shoper-get-token";

const CONFIG_FILE_NAME = "config.json";

export class Index {
  logger: Logger;
  config: Config;
  fw: FileWatcher;
  readFileOnStart = false;
  shoperService: ShoperService;
  eMail: EMail;
  backup: Backup;
  fwStream: Subscription;
  shoperStream: Subscription;

  constructor(configFileName: string) {
    this.init(configFileName);
    this.fw = new FileWatcher(this.config);
    this.shoperService = new ShoperService(this.config);
    this.shoperStream = this.shoperService.doneTask$.subscribe((task) => {
      this.logger.info(`Zakończono wykonywanie taska ${task.id} ze statusem ${task.status}`);
    });
    this.backup = new Backup(this.config);
    this.eMail = new EMail(this.config);
    const message = `Właśnie został ponownie uruchomiony serwis shoperintegrations. W razie pytań prosimy o kontakt z administratorem ${this.config.emailNoticication.adminsNotifications}`;
    const messageHtml = `<h3>Właśnie został ponownie uruchomiony serwis shoperintegrations.</h3> <p>W razie pytań prosimy o kontakt z administratorem 👨🏽‍💻 ${this.config.emailNoticication.adminsNotifications}</p><b>Życzymy miłego dnia 😀</b>`;
    this.eMail.sendMail(`🎉 Nastąpił restart systemu shoperingegration`, message, messageHtml, [this.config.emailNoticication.alerts[0]]);
  }

  init(configFileName: string): void {
    this.config = Config.getInstance(configFileName);
    configure(this.config.log4js);
    this.logger = getLogger("index");
    this.logger.debug("Start serwisu shoperintergration");
  }

  retryPipeline = retryWhen((errors) =>
    errors.pipe(
      concatMap((e, i) =>
        iif(
          () => i >= this.config.attempsWhenError,
          throwError(e),
          of(e).pipe(
            tap((val) => (this.readFileOnStart = false)),
            delay(this.config.errorDelayTime)
          )
        )
      )
    )
  );

  startWatchFile(): void {
    this.fwStream = this.fw
      .startWatch(this.config.fileInfo.path, this.config.fileInfo.fileName, this.readFileOnStart)
      .pipe(
        tap((val) => this.logger.debug("Nowe dane w strumieniu", val)),
        this.backup.addNewFilonData(),
        this.retryPipeline,
        parseCSVDataStream(this.config.parserOptions),
        replaceCommaInPrice(),
        replaceNotSupportedSight()
      )
      .subscribe((filonMerchandises: FilonMerchandise[]) => {
        this.logger.debug(`Sparsowane dane ${filonMerchandises}. Dane zostaną przekazane do nowego taska`);
        filonMerchandises.forEach((filonItems: FilonMerchandise) => {
          this.shoperService.addTask(filonItems);
        });
      });
  }

  destroy() {
    ShoperGetToken.authorizationToken = undefined;
    this.shoperStream && this.shoperStream.unsubscribe();
    this.fwStream && this.fwStream.unsubscribe();
    this.fw && this.fw.close();
  }
}

const main = (function () {
  let index: Index;
  index && index.destroy();
  index = new Index(CONFIG_FILE_NAME);
  index.startWatchFile();
  setInterval(async () => {
    index && index.destroy();
    await setTimeout(() => {
      console.log(".....");
    }, 10000);
    index = new Index(CONFIG_FILE_NAME);
    index.startWatchFile();
  }, 1000 * 60 * 60 * 24);
})();
