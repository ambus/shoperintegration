import { FileWatcher } from "./file-watcher";
import { Observable } from "rxjs";
const path = require("path");
import * as fs from "fs";

const TEST_FILE_PATH = "../../tmp/test.csv";
const EXAMPLE_DATA = `product_code;stock;price
BUKWT2010;  41;110,0
BSZK0F1FLE051;   3;139,57
BSZK0F1FLE011;   3;139,57
BSZK0IZMWAS02;   2;16,00
ICAZG10KLD;  42;120,0`;

describe("FileWatcher", () => {
  let fileWatcher: FileWatcher;
  beforeEach(() => {
    fileWatcher = new FileWatcher();
  });

  it("Czy jest zdefiniowana klasa FileWatcher", done => {
    expect(FileWatcher).toBeDefined();
    done();
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
    fs.unlinkSync(TEST_FILE_PATH);
    fw.streamWithDataInsertedToWatchingFile.subscribe((data: string) => {
      expect(data).toEqual(EXAMPLE_DATA)
      done();
    });
    fs.writeFileSync(TEST_FILE_PATH, EXAMPLE_DATA, {encoding: 'utf8'});
    fw.startWatch(TEST_FILE_PATH, true);
  });

  it("w strumieniu powinny pojawić się dane wgrane do obserwowanego pliku", () => {});
  it("po zmianie danych w pliku powinny pojawić się dane w strumieniu", () => {});
  it("powinien usunąć plik z danymi po przeczytaniu ich", () => {});
  it("klasa powinna prawidłowo odczytać wgrane dane do pliku", () => {});
  it("w przypadku błędu odczytu dane powinny zostać zalogowane ", () => {});
});
