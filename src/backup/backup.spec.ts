import * as fs from "fs";
import { Subject } from "rxjs/internal/Subject";
import { CSVFileMockup } from "../../test/mockup/csv-file-mockup.mockup";
import { Config } from "../config/config";
import { stringGenerator } from "../lib/string-generator";
import { Backup } from "./backup";
const TEST_CONFIG_FILE_PATH = "configForTests.json";

describe("backup", () => {
  let backup: Backup;
  beforeAll(() => {
    backup = new Backup(Config.getInstance(TEST_CONFIG_FILE_PATH));
  });
  it("można utworzyć obiekt klasy backup", () => {
    expect(backup).toBeDefined();
  });

  it("po wpięciu w strumień i przekazaniu danych powienien utworzyć plik który w nazwie ma dzisiejszą datę", (done) => {
    const stream = new Subject<string>();

    if (fs.existsSync(backup.backupFileName)) {
      fs.unlinkSync(backup.backupFileName);
    }
    const filename = `tmp/backup/${stringGenerator()}.bac`;
    const spyFunction = jest.spyOn(backup, "backupFileName", "get").mockReturnValue(filename);

    stream.pipe(backup.addNewFilonData()).subscribe((stream: string) => {
      done();
    });

    stream.next(CSVFileMockup);
  });

  it("po wpięciu w strumień i przekazaniu danych powienien utworzyć plik do którego umieści dane", (done) => {
    const filename = `tmp/backup/${stringGenerator()}.bac`;

    const spyFunction = jest.spyOn(backup, "backupFileName", "get").mockReturnValue(filename);
    const stream = new Subject<string>();
    if (fs.existsSync(filename)) {
      fs.unlinkSync(filename);
    }
    stream.pipe(backup.addNewFilonData()).subscribe((stream: string) => {
      fs.readFile(filename, Config.getInstance(TEST_CONFIG_FILE_PATH).encoding, (err: NodeJS.ErrnoException | null, data: string) => {
        expect(data).toBe(CSVFileMockup);
        done();
      });
    });
    stream.next(CSVFileMockup);
  });

  it("jeśli plik już istnieje to strumień ma tylko dopisać dane do tego pliku ", (done) => {
    const filename = `tmp/backup/${stringGenerator()}.bac`;
    const spyFunction = jest.spyOn(backup, "backupFileName", "get").mockReturnValue(filename);
    const stream = new Subject<string>();
    if (fs.existsSync(backup.backupFileName)) {
      fs.unlinkSync(backup.backupFileName);
    }
    stream.pipe(backup.addNewFilonData(), backup.addNewFilonData()).subscribe((stream: string) => {
      fs.readFile(backup.backupFileName, Config.getInstance(TEST_CONFIG_FILE_PATH).encoding, (err: NodeJS.ErrnoException | null, data: string) => {
        const expectedString = `${CSVFileMockup}${CSVFileMockup.replace("product_code;stock;price;priceE;warnLevel;other_price", "")}`;
        fs.unlinkSync(backup.backupFileName);
        expect(data).toBe(expectedString);
        done();
      });
    });
    fs.readFile("./tmp/testBackupFile.csv", Config.getInstance(TEST_CONFIG_FILE_PATH).encoding, (err: NodeJS.ErrnoException | null, data: string) => {
      if (err) {
        stream.error(err);
      }
      stream.next(data);
    });
  });
});
