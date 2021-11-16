import { Config } from "../config/config";
import { OperatorFunction, Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import { Logger, getLogger } from "log4js";
import * as fs from "fs";

export class Backup {
  config: Config;
  logger: Logger;

  constructor(config: Config) {
    this.config = config;
    this.logger = getLogger("Backup");
  }

  addNewFilonData(): OperatorFunction<string, string> {
    return (source: Observable<string>) =>
      source.pipe(
        map((filonMerchandisesString: string) => {
          if (this.config.backup.status) {
            let stringToSave = filonMerchandisesString;
            if (fs.existsSync(this.backupFileName)) {
              stringToSave = filonMerchandisesString.replace("product_code;stock;price;priceE;warnLevel", "");
              stringToSave = filonMerchandisesString.replace("product_code;stock;price;priceE", "");
            }
            fs.appendFileSync(this.backupFileName, stringToSave, { encoding: "utf8" });
          }
          return filonMerchandisesString;
        }),
        catchError((err: unknown, caught: Observable<string>) => {
          this.logger.error(`Nie można zapisać danych do pliku z backupem`, err);
          throwError(err);
          return caught;
        })
      );
  }

  get backupFileName(): string {
    const dateToConvert = new Date();
    const newDate = `${dateToConvert.getFullYear()}-${dateToConvert.getMonth() < 9 ? "0" : ""}${dateToConvert.getMonth() + 1}-${dateToConvert.getDate() < 10 ? "0" : ""}${dateToConvert.getDate()}.bac`;
    return `${this.config.backup.filelocation}/${newDate}`;
  }
}
