import * as fs from "fs";
import { Observable } from "rxjs";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { filonStringMerchandise } from "../test/mockup/filon-string.mockup";
import { mockup_shoperGetToken } from "../test/mockup/shoper-get-token.mockup";
import { mockup_getAjaxStock } from "../test/mockup/shoper-stock.mockup";
import { mockup_pushAjaxShoperUpdate } from "../test/mockup/shoper-update.mockup";
import { Index } from "./index";
import { stringGenerator } from "./lib/string-generator";
import { Task } from "./models/task";
import { ErrorType } from "./models/error-type";
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

describe("index - testy integracyjne", () => {
  let index: Index;
  let fileName = `${stringGenerator()}.csv`;
  jest.setTimeout(20000);
  beforeEach(() => {
    index = new Index(TEST_CONFIG_FILE_PATH);
    index.config.fileInfo.fileName = fileName;
    index.config.fileInfo.path = "tmp";
    index.config.shoperConfig.delayTimeInMilisec = 10;
    mockup_shoperGetToken();
    mockup_getAjaxStock(index.shoperService.shoperStockService);
    mockup_pushAjaxShoperUpdate(index.shoperService.shoperUpdateService);
  });

  it("gdy dane pojawią się w pliku musi przejść cały proces i dane muszą pozytywnie zostać zaktualizowane w shoperze", done => {
    index.startWatchFile();
    let counter = 0;
    index.shoperService.doneTask$.subscribe((task: Task) => {
      counter++;
      if (counter === 4) {
        expect(task.filonMerchandise.product_code).toBe("SBARDC22");
        done();
      }
    });
    fs.writeFileSync(`tmp/${fileName}`, filonStringMerchandise, { encoding: "utf8" });
  });

  it("jeśli towar przekazany do aktualizacji nie istnieje w shoperze to warunkowo ma zostać wysłany @ z powiadomieniem", done => {
    let sendMail = jest.spyOn(index.shoperService.eMail, "sendMail").mockImplementation()
    jest.spyOn(index.shoperService.shoperStockService, "_getAjaxStocks").mockReturnValue(
      Observable.create((observer: AnonymousSubject<any>) => {
        let emtyResponse = {
          originalEvent: null,
          xhr: null,
          request: null,
          status: null,
          response: {
            count: "1",
            pages: 1,
            page: 1,
            list: []
          },
          responseText: null,
          responseType: null
        };
        observer.next(emtyResponse);
        observer.complete();
      })
    );


    index.startWatchFile();

    let counter = 0;
    index.shoperService.doneTask$.subscribe((task: Task) => {
      expect(task.error.errorType).toBe(ErrorType.ITEM_NOT_FOUND_IN_SHOPER)
      done();
    });
    fs.writeFileSync(`tmp/${fileName}`, `product_code;stock;price;priceE
    BSZK0F1FLE051;   2;139,57;15,00`, { encoding: "utf8" });
  });
});
