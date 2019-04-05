import { FileWatcher } from "./file-watcher";
const path = require("path");
const TEST_FILE_PATH = "../../tmp/test.csv";

describe("FileWatcher", () => {
  let fileWatcher: FileWatcher;
  beforeEach(() => {
    fileWatcher = new FileWatcher();
  })

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
  })

  it("powinien istnieć strumień z przychodzącymi danymi - do którego można się podpiąć", () => {
    expect(fileWatcher.streamWithDataInsertedToWatchingFile).toBeDefined();
  });

  it("w strumieniu powinny pojawić się dane wgrane do obserwowanego pliku", () => {});
  it("po zmianie danych w pliku powinny pojawić się dane w strumieniu", () => {});
  it("powinien usunąć plik z danymi po przeczytaniu ich", () => {});
  it("klasa powinna prawidłowo odczytać wgrane dane do pliku", () => {});
  it("w przypadku błędu odczytu dane powinny zostać zalogowane ", () => {});
});
