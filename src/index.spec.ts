import { Index } from "./index";
const TEST_CONFIG_FILE_PATH = "configForTests.json";
import * as fs from "fs";
import { stringGenerator } from "./lib/string-generator";
import { Observable } from "rxjs";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { retryWhen } from "rxjs/operators";

var index: Index;
const EXAMPLE_DATA = `product_code;stock;price
BUKWT2010;  41;110,0
BSZK0F1FLE051;   3;139,57
BSZK0F1FLE011;   3;139,57
BSZK0IZMWAS02;   2;16,00
ICAZG10KLD;  42;120,0
`;
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

  it("po otrzymaniu danych powinien wywołać funkcję przekazującą dane do aktualizacji w shoperze", done => {
    let index2: Index;
    index2 = new Index(TEST_CONFIG_FILE_PATH);
    let fileName = `${stringGenerator()}.csv`;
    index2.config.fileInfo.fileName = fileName;

    spyOn(index2, "sendDataToShoper").and.callFake(function(obj: {}) {
      done();
    });

    index2.startWatchFile();
    fs.writeFileSync(`tmp/${fileName}`, EXAMPLE_DATA, { encoding: "utf8" });
  });

  it("w przypadku błędu odczytu pliku powinien pięciokrotnie ponowić próbę odczytu", done => {
    let index2: Index;
    index2 = new Index(TEST_CONFIG_FILE_PATH);
    let fileName = `${stringGenerator()}.csv`;
    index2.config.fileInfo.fileName = fileName;
    index2.config.errorDelayTime = 50;
    let index = 0;

    spyOn(index2.fw, "readFile").and.callFake(function(obj: {}) {
      return Observable.create((observer: AnonymousSubject<string>) => {
        index++;
        if (index >= index2.config.attempsWhenError) {
          done();
        }
        observer.error(new Error("Napotkano błąd podczas próby odczytu pliku"));
      });
    });
    index2.startWatchFile();
  });

  it("retryWhen gdy napotka błędy powinien próbowac podjąć ponowną próbe subskrybcji określoną ilość razy z przerwą określoną w konfiguracji", done => {
    let index = 0;
    let index2: Index;
    index2 = new Index(TEST_CONFIG_FILE_PATH);
    let obser = Observable.create((observer: AnonymousSubject<string>) => {
      if (index >= index2.config.attempsWhenError) {
        done();
      }
      index++;
      observer.error(new Error("Napotkano błąd podczas próby odczytu pliku"));
    });
    obser.pipe(index2.retryPipeline).subscribe((data: any) => {}, err => {});
  });
});
