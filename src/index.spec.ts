// import * as index from "./index";
// import { init, config, logger, loadDefaultConfiguration, CONFIG_FILE_NAME } from "./index";
import { stringGenerator } from "./lib/string-generator";
import { Config } from "./config/config";
import { Index, IndexType } from "./index";
const TEST_CONFIG_FILE_PATH = "configForTests.json";


beforeAll(() => {
  spyOn(console, "error");
  Config.getInstance(TEST_CONFIG_FILE_PATH);
  spyOn(Index.logger, "trace");
})

describe("Index", () => {
  it("powinien zawierać funkcję inicjującą", done => {
    expect(Index.init).toBeDefined();
    done();
  });

  it("powinien zawierać instancję loggera", done => {
    Index.init("tmp/testConfig.json");
    expect(Index.logger).toBeDefined();
    done();
  });

  it("index.ts powinien zawierać załadowaną konfigurację z pliku config.json", done => {
    expect(Index.config).toBeDefined();
    done();
  });

  it("w konfiguracji powinien znajdować się obiekt log4js z konfiguracją dla loggiera", done => {
    expect(Index.config.log4js).toBeDefined();
    done();
  });

  it("typ konfiguracji powinien wskazywać na plik", done => {
    expect(Index.config.configurationType).toBeDefined();
    expect(Index.config.configurationType).toContain(Index.CONFIG_FILE_NAME);
    done();
  });

  // it("", done => {
  //   Index.init("tmp/testConfig.json");
  //   expect(Index.config.fileInfo.fileName).toContain("test.csv");
  // });
});
