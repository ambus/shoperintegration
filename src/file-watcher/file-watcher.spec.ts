import { FileWatcher } from "./file-watcher";
import { Observable } from "rxjs";
const path = require("path");
import * as fs from "fs";
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
    fileWatcher.startWatch(path.resolve(__dirname, TEST_FILE_PATH), true);
    expect(fileWatcher.isWatching).toBeTruthy();
  });

  it("w przypadku napotkania błędów podczas odczytu startWatch powinien wyrzucić wyjątek", () => {
    fileWatcher.startWatch(path.resolve(__dirname, `${TEST_FILE_PATH}blad`), true);
  });

  it("powinien istnieć strumień z przychodzącymi danymi - do którego można się podpiąć", () => {
    expect(fileWatcher.streamWithDataInsertedToWatchingFile).toBeDefined();
    let stream = fileWatcher.streamWithDataInsertedToWatchingFile;
    expect(stream instanceof Observable).toBeTruthy();
  });

  it("w strumieniu powinny pojawić się dane wgrane do obserwowanego pliku podczas uruchamiania obserwowania", done => {
    let fw = new FileWatcher();
    if (fs.existsSync(TEST_FILE_PATH)) {
      fs.unlinkSync(TEST_FILE_PATH);
    }
    fw.streamWithDataInsertedToWatchingFile.subscribe((data: string) => {
      expect(data).toEqual(EXAMPLE_DATA);
      done();
    });
    fs.writeFileSync(TEST_FILE_PATH, EXAMPLE_DATA, { encoding: "utf8" });
    fw.startWatch(TEST_FILE_PATH, true);
  });

  it("funkcja usuwająca pliki powinna usunąć wskazany plik", done => {
    fs.writeFileSync(TEST_FILE_PATH, EXAMPLE_DATA, { encoding: "utf8" });
    if (fs.existsSync(TEST_FILE_PATH)) {
      fs.unlinkSync(TEST_FILE_PATH);
      expect(true).toBeTruthy();
      done();
    } else {
      expect(false).toBeTruthy();
      done();
    }
  });

  it("po zmianie danych w pliku powinny pojawić się dane w strumieniu", () => {});

  it("powinien usunąć plik z danymi po przeczytaniu ich", done => {
    let fw = new FileWatcher();
    if (fs.existsSync(TEST_FILE_PATH)) {
      fs.unlinkSync(TEST_FILE_PATH);
    }
    fw.streamWithDataInsertedToWatchingFile.subscribe((data: string) => {
      expect(data).toEqual(EXAMPLE_DATA);
      expect(fs.existsSync(TEST_FILE_PATH)).toBeFalsy();
      done();
    });
    fs.writeFileSync(TEST_FILE_PATH, EXAMPLE_DATA, { encoding: "utf8" });
    fw.startWatch(TEST_FILE_PATH, true);
  });

  
  it("w przypadku błędu odczytu dane powinny zostać zalogowane ", () => {});
});
