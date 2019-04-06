import { Config } from "./config";
import * as fs from "fs";

const TEST_CONFIG_FILE_PATH = "config.json";

describe("Konfiguracja", () => {
  var config: Config;
  beforeAll(() => {
    config = Config.getInstance();
  });

  test("w konfiguracji powinien znajdować się obiekt log4js z konfiguracją dla loggiera", done => {
    expect(config.log4js).toBeDefined();
    done();
  });

  test("typ konfiguracji powinien wskazywać na plik", done => {
    expect(config.configurationType).toBeDefined();
    expect(config.configurationType).toContain(TEST_CONFIG_FILE_PATH);
    done();
  });

  test("każda kolejne utworzenie obiektu powinno być tą samą instancję", done => {
    const newInfo = "New info data";
    expect(config.configurationType).not.toEqual(newInfo);
    config.configurationType = newInfo;
    let configV2 = Config.getInstance();
    expect(configV2.configurationType).toEqual(newInfo);
    done();
  });
});

describe("Konfiguracja - domyślne wartości", () => {
  var config: Config;

  beforeAll(() => {
    fs.renameSync(TEST_CONFIG_FILE_PATH, `test${TEST_CONFIG_FILE_PATH}`);
    config = Config.getInstance(TEST_CONFIG_FILE_PATH + "fff");
  });

  test("jeśli plik z konfiguracją nie istnieje lub zawiera błędy powinna zostać załadowana domyślna konfiguracja", done => {
    expect(config).toBeDefined();
    expect(config.log4js).toBeDefined();
    expect(config.configurationType).toEqual("default");
    expect(config.encoding).toEqual('utf8');
    done();
  });
  afterAll(() => {
    fs.renameSync(`test${TEST_CONFIG_FILE_PATH}`, TEST_CONFIG_FILE_PATH);
  });
});
