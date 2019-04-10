import { FileWatcher } from "./file-watcher";
import { Observable } from "rxjs";
const path = require("path");
const mock = require("mock-fs");
import * as fs from "fs";
import { stringGenerator } from "../lib/string-generator";
import { Config } from "../config/config";
import { CONFIG_FILE_NAME } from "../index";

const TEST_FILE_PATH = "../../tmp/test.csv";
const EXAMPLE_DATA = `product_code;stock;price
BUKWT2010;  41;110,0
BSZK0F1FLE051;   3;139,57
BSZK0F1FLE011;   3;139,57
BSZK0IZMWAS02;   2;16,00
ICAZG10KLD;  42;120,0`;

beforeAll(() => {
  Config.getInstance(CONFIG_FILE_NAME);
});

describe("FileWatcher", () => {
  let fileWatcher: FileWatcher;
  beforeEach(() => {
    fileWatcher = new FileWatcher();
  });

  it("Czy jest zdefiniowana klasa FileWatcher", done => {
    expect(FileWatcher).toBeDefined();
    done();
  });

  it("powinan zostać zainicjowana konfiguracja", () => {
    expect(Config.getInstance()).toHaveProperty("encoding");
  });

  it("powinien zawierać instancję loggera", () => {
    expect(fileWatcher.logger).toBeDefined();
  });

  it("powinien zawierać funkcję uruchamiającą obserwowanie plików", () => {
    expect(fileWatcher.startWatch).toBeDefined();
  });

  it("można pobrać informację czy plik jest obserwowany", () => {
    expect(fileWatcher.isWatching).toBeFalsy();
    fileWatcher.startWatch(path.resolve(__dirname), TEST_FILE_PATH, true);
    expect(fileWatcher.isWatching).toBeTruthy();
  });

  it("w przypadku napotkania błędów podczas odczytu startWatch powinien wyrzucić wyjątek", () => {
    try {
      fileWatcher.startWatch(path.resolve(__dirname), `${TEST_FILE_PATH}blad`, true);
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.name).toEqual("Error");
      expect(err.code).toEqual("ENOENT");
    }
  });

  it("powinien istnieć strumień z przychodzącymi danymi - do którego można się podpiąć", () => {
    expect(fileWatcher.streamWithDataInsertedToWatchingFile).toBeDefined();
    let stream = fileWatcher.streamWithDataInsertedToWatchingFile;
    expect(stream instanceof Observable).toBeTruthy();
  });

  it("w strumieniu powinny pojawić się dane wgrane do obserwowanego pliku podczas uruchamiania obserwowania", done => {
    let fw = new FileWatcher();
    let fileName = `${stringGenerator()}.csv`;
    if (fs.existsSync(`./tmp/${fileName}`)) {
      fs.unlinkSync(`./tmp/${fileName}`);
    }
    fw.streamWithDataInsertedToWatchingFile.subscribe((data: string) => {
      expect(data).toEqual(EXAMPLE_DATA);
      done();
    });
    fs.writeFileSync(`./tmp/${fileName}`, EXAMPLE_DATA, { encoding: "utf8" });
    fw.startWatch("./tmp/", fileName, true);
  });

  it("funkcja usuwająca pliki powinna usunąć wskazany plik", done => {
    let fileName = `${stringGenerator()}.csv`;
    fs.writeFileSync(`./tmp/${fileName}`, EXAMPLE_DATA, { encoding: "utf8" });
    if (fs.existsSync(`./tmp/${fileName}`)) {
      fs.unlinkSync(`./tmp/${fileName}`);
      expect(true).toBeTruthy();
      done();
    } else {
      expect(false).toBeTruthy();
      done();
    }
  });

  it("powinien usunąć plik z danymi po przeczytaniu ich", done => {
    let fw = new FileWatcher();
    let fileName = `${stringGenerator()}.csv`;

    if (fs.existsSync(`./tmp/${fileName}`)) {
      fs.unlinkSync(`./tmp/${fileName}`);
    }
    fw.streamWithDataInsertedToWatchingFile.subscribe((data: string) => {
      expect(data).toEqual(EXAMPLE_DATA);
      expect(fs.existsSync(`./tmp/${fileName}`)).toBeFalsy();
      done();
    });
    fs.writeFileSync(`./tmp/${fileName}`, EXAMPLE_DATA, { encoding: "utf8" });
    fw.startWatch("./tmp/", fileName, true);
  });

  it("w przypadku błędu odczytu pliku powinien zostać wyrzucony wyjątek", async done => {

    new FileWatcher().readFile("test.error.csv").subscribe(
      (res: string) => expect(false).toBeTruthy(),
      (err: any) => {
        expect(err.name).toEqual("Error");
        expect(err.message).toEqual("ENOENT: no such file or directory, open 'test.error.csv'");
        done();
      }
    );
  });

  it("w przypadku błędu odczytu pliku funkcja readFileAndSendThemToStream powinna przechwycić wyjątek", done => {
    mock({
      "test.csv": EXAMPLE_DATA
    });
    let fw = new FileWatcher();
    spyOn(fw, "readFile").and.callFake(function() {
      throw new Error("Błąd odczytu");
    });

    fw.readFileAndSendThemToStream("test.csv").catch((err: Error) => {
      expect(err.name).toEqual("Error");
      expect(err.message).toEqual("Błąd odczytu");
      mock.restore();
      done();
    });
  });

  it("w przypadku błędu pliku funkcja startWatch powinna przechwycić wyjątek, zalogować go a następnie zwrócić", done => {
    let fileName = `${stringGenerator()}.csv`;
    let fw = new FileWatcher();
    spyOn(fw, "readFileAndSendThemToStream").and.callFake(function() {
      throw new Error("Błąd odczytu");
    });
    spyOn(fw.logger, "error").and.callFake(function(obj: any) {
      expect(obj).toContain(`Napotkano błąd podczas odczytu pliku ./tmp/${fileName}`);
    });

    try {
      fw.startWatch("./tmp/", fileName, true);
    } catch (err) {
      expect(err.name).toEqual("Error");
      expect(err.message).toEqual("Błąd odczytu");
      done();
    }
  });

  it("watchFile powinien zwrócić Subject w którym powinna przyjść informacja o pojawieniu się pliku", done => {
    let fileName = `${stringGenerator()}.csv`;

    new FileWatcher().watchFile(`tmp`).subscribe((path: string) => {
      if (path.toLowerCase() === `tmp/${fileName}`.toLowerCase()) {
        fs.unlinkSync(`tmp/${fileName}`);
        done();
      }
    });
    fs.writeFileSync(`tmp/${fileName}`, "", { encoding: "utf8" });
  });

  it("po zmianie danych w pliku powinny pojawić się one w strumieniu", done => {
    let fileName = `${stringGenerator()}.csv`;
    let fw = new FileWatcher();
    let counter = 0;

    fw.streamWithDataInsertedToWatchingFile.subscribe((data: string) => {
      if (counter === 0) {
        expect(data).toEqual("");
        counter += 1;
        fs.writeFileSync(`tmp/${fileName}`, EXAMPLE_DATA, { encoding: "utf8" });
      } else {
        expect(data).toEqual(EXAMPLE_DATA);
        done();
      }
    });
    fw.startWatch(`tmp`, fileName, true);
    fs.writeFileSync(`tmp/${fileName}`, "", { encoding: "utf8" });
  });

  it("w przypadku błędu odczytu watcher powinien zalogować błąd odczytu", done => {
    let fileName = `${stringGenerator()}.csv`;
    let fw = new FileWatcher();

    spyOn(fw.logger, "error").and.callFake(function(obj: any) {
      expect(obj).toContain(`Napotkano błąd podczas próby odczytania pliku tmp/${fileName}`);
      done();
    });

    spyOn(fw, "readFileAndSendThemToStream").and.callFake(function() {
      throw new Error("Błąd odczytu");
    });

    fw.ifChangeWasInWatchFileReadThem(`tmp/${fileName}`, `tmp/${fileName}`);
  });

  it("w przypadku blędu odczytu pliku serwis powinien ponowić próbę odczytania 5 krotnie", () => {
  })
});
