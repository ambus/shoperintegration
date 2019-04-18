import { Index } from "./index";
const TEST_CONFIG_FILE_PATH = "configForTests.json";

var index: Index;

beforeAll(() => {
  spyOn(console, "error");
  index = new Index(TEST_CONFIG_FILE_PATH);
  spyOn(index.logger, "trace").and.callFake(() => {});
  spyOn(index.logger, "debug").and.callFake(() => {});
});

describe("Index", () => {
  it("powinien zawierać instancję loggera", done => {
    expect(index.logger).toBeDefined();
    done();
  });

  it("index.ts powinien zawierać załadowaną konfigurację z pliku config.json", done => {
    expect(index.config).toBeDefined();
    done();
  });

  it("w konfiguracji powinien znajdować się obiekt log4js z konfiguracją dla loggiera", done => {
    expect(index.config.log4js).toBeDefined();
    done();
  });

  it("typ konfiguracji powinien wskazywać na plik", done => {
    expect(index.config.configurationType).toBeDefined();
    expect(index.config.configurationType).toContain(TEST_CONFIG_FILE_PATH);
    done();
  });

});
