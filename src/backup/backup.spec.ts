import * as fs from "fs";
import { Subject } from "rxjs/internal/Subject";
import { CSVFileMockup } from "../../test/mockup/csv-file-mockup.mockup";
import { Config } from "../config/config";
import { stringGenerator } from "../lib/string-generator";
import { Backup } from "./backup";

describe("backup", () => {
  let backup: Backup;
  beforeAll(() => {
    backup = new Backup(Config.getInstance());
  });
  it("można utworzyć obiekt klasy backup", () => {
    expect(backup).toBeDefined();
  });

  it("po wpięciu w strumień i przekazaniu danych powienien utworzyć plik który w nazwie ma dzisiejszą datę", done => {
    let stream = new Subject<string>();
    if (fs.existsSync(backup.backupFileName)) {
      fs.unlinkSync(backup.backupFileName);
    }
    stream.pipe(backup.addNewFilonData()).subscribe((stream: string) => {
      done();
    });
    fs.readFile("./tmp/testBackupFile.csv", Config.getInstance().encoding, (err: Error, data: string) => {
      if (err) {
        stream.error(err);
      }
      stream.next(data);
    });
  });

  it("po wpięciu w strumień i przekazaniu danych powienien utworzyć plik do którego umieści dane", done => {
    let filename = `tmp/backup/${stringGenerator()}.bac`;
  
    let spyFunction = jest.spyOn(backup, "backupFileName", "get").mockReturnValue(filename);
    let stream = new Subject<string>();
    if (fs.existsSync(backup.backupFileName)) {
      fs.unlinkSync(backup.backupFileName);
    }
    stream.pipe(backup.addNewFilonData()).subscribe((stream: string) => {
      fs.readFile(backup.backupFileName, Config.getInstance().encoding, (err: Error, data: string) => {
        expect(data).toBe(CSVFileMockup);
        done();
      });
    });
    fs.readFile("./tmp/testBackupFile.csv", Config.getInstance().encoding, (err: Error, data: string) => {
      if (err) {
        stream.error(err);
      }
      stream.next(data);
    });
  });

  it("jeśli plik już istnieje to strumień ma tylko dopisać dane do tego pliku ", done => {
    let filename = `tmp/backup/${stringGenerator()}.bac`;
    let spyFunction = jest.spyOn(backup, "backupFileName", "get").mockReturnValue(filename);
    let stream = new Subject<string>();
    if (fs.existsSync(backup.backupFileName)) {
      fs.unlinkSync(backup.backupFileName);
    }
    stream
      .pipe(
        backup.addNewFilonData(),
        backup.addNewFilonData()
      )
      .subscribe((stream: string) => {
        fs.readFile(backup.backupFileName, Config.getInstance().encoding, (err: Error, data: string) => {
          let expectedString = `${CSVFileMockup}${CSVFileMockup.replace("product_code;stock;price;priceE", "")}`;
          fs.unlinkSync(backup.backupFileName);
          expect(data).toBe(expectedString);
          done();
        });
      });
    fs.readFile("./tmp/testBackupFile.csv", Config.getInstance().encoding, (err: Error, data: string) => {
      if (err) {
        stream.error(err);
      }
      stream.next(data);
    });
  });
});
