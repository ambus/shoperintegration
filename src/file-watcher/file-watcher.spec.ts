import { FileWacher } from "./file-watcher";

describe("FileWatcher", () => {
  test("Czy jest zdefiniowana klasa FileWatcher", done => {
    expect(FileWacher).toBeDefined();
    done()
  });

  test("powinien istnieć strumień z przychodzącymi danymi - do którego można się podpiąć", done => {
  });
  test("w strumieniu powinny pojawić się dane wgrane do obserwowanego pliku", done => {
  });
  test("powinien usunąć plik z danymi po przeczytaniu ich", done => {
  });
  test("klasa powinna prawidłowo odczytać wgrane dane do pliku", done => {
  });
  test("w przypadku błędu odczytu dane powinny zostać zalogowane ", done => {
  });
});
