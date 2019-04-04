// import * as index from "./index";
// import { init, config, logger, loadDefaultConfiguration, CONFIG_FILE_NAME } from "./index";
var Index;

describe("Index", () => {
  beforeAll(() => {
    Index = undefined;
    Index = require("./index");
  });

  test("powinien zawierać funkcję inicjującą", done => {
    expect(Index.init).toBeDefined();
    done();
  });

  test("powinien zawierać instancję loggera", done => {
    Index.init();
    expect(Index.logger).toBeDefined();
    done();
  });

  test("index.ts powinien zawierać załadowaną konfigurację z pliku config.json", done => {
    expect(Index.config).toBeDefined();
    done();
  });

  test("w konfiguracji powinien znajdować się obiekt log4js z konfiguracją dla loggiera", done => {
    expect(Index.config.log4js).toBeDefined();
    done();
  });

  test("typ konfiguracji powinien wskazywać na plik", done => {
    expect(Index.config.configurationType).toBeDefined();
    expect(Index.config.configurationType).toContain(Index.CONFIG_FILE_NAME);
    done();
  });
});

