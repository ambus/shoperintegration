import { Config } from "../../config/config";
import { ShoperStockService } from "./shoper-stock-service";
import { stringGenerator } from "../../lib/string-generator";
import { ShoperStock } from "../../models/shoper-stock";
import { Observable } from "rxjs";
import { AjaxResponse } from "rxjs/ajax";
import { shoperStockMockup, mockup_getAjaxStock } from "../../../test/mockup/shoper-stock.mockup";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { ErrorType } from "../../models/error-type";
const TEST_CONFIG_FILE_PATH = "configForTests.json";

describe("shoperStockService", () => {
  let shoperStockService: ShoperStockService;
  beforeAll(() => {
    shoperStockService = new ShoperStockService(Config.getInstance(TEST_CONFIG_FILE_PATH));
    mockup_getAjaxStock(shoperStockService);
  });

  it("musi zawierać konstruktor", () => {
    expect(shoperStockService).toBeDefined();
  });

  it("funkcja _getAjaxStock musi zwrócić obiekt AjaxRequest", () => {
    expect(shoperStockService._getAjaxStocks).toBeDefined();
  });

  it("_getAjaxStocks zwraca obiekt AjaxResponse z obiektem ShoperReturnList z listą obiektów ShoperStock", (done) => {
    shoperStockService._getAjaxStocks(stringGenerator(), stringGenerator()).subscribe((observer: AjaxResponse) => {
      expect(observer.response).toBeDefined();
      expect(observer.response.list).toBeDefined();
      expect(observer.response.list[0]).toBeDefined();
      expect(observer.response.list[0].stock_id).toBeDefined();
      done();
    });
  });

  it("funkcja getStock musi zwracać obiekt Observable z wyłapanym obiektem Stocks", (done) => {
    shoperStockService.getStock(stringGenerator(), stringGenerator()).subscribe((observer: ShoperStock) => {
      expect(observer).toBeDefined();
      expect(observer.stock_id).toBeDefined();
      done();
    });
  });
});

describe("shoperStockService - błędy połączenia", () => {
  // beforeAll(() => {
  //   shoperStockService = new ShoperStockService(Config.getInstance());
  //   mockup_getAjaxStock(shoperStockService);
  // });
  it("jeśli funkcja napotka błąd podczas próby pobrania tokena to powinna ponowić próbę połączenia określoną ilość razy z zadanymi przerwami i zwrócić błąd jeśli błędy się powtarzają", (done) => {
    const shoperStockService: ShoperStockService = new ShoperStockService(Config.getInstance(TEST_CONFIG_FILE_PATH));

    const errorString = "Błąd przy pobieraniu stocka";
    let counter = -1;
    const spy = jest.spyOn(shoperStockService, "_getAjaxStocks").mockReturnValue(
      Observable.create((observer: AnonymousSubject<any>) => {
        counter++;
        observer.error(errorString);
      })
    );

    shoperStockService.getStock(stringGenerator(), stringGenerator()).subscribe(
      (observer: ShoperStock) => {
        return;
      },
      (err) => {
// expect(spy).toBeCalledTimes(3);
        expect(counter).toBe(3);
        expect(err).toBe("Błąd przy pobieraniu stocka");
        done();
      }
    );
  });

  it("jeśli funkcja napotka błąd podczas próby pobrania tokena to powinna ponowić próbę połączenia określoną ilość razy z zadanymi przerwami i w 3 próbie prawidłowo wykonać zadanie", (done) => {
    const shoperStockService: ShoperStockService = new ShoperStockService(Config.getInstance());

    const errorString = "Błąd przy pobieraniu stocka";
    let counter = -1;
    jest.spyOn(shoperStockService, "_getAjaxStocks").mockReturnValue(
      Observable.create((observer: AnonymousSubject<any>) => {
        counter++;
        if (counter < 3) {
          observer.error(errorString);
        } else {
          observer.next(shoperStockMockup);
          observer.complete();
        }
      })
    );

    shoperStockService.getStock(stringGenerator(), stringGenerator()).subscribe(
      (val: ShoperStock) => {
        expect(counter).toBe(3);
        expect(val.stock_id).toBe(shoperStockMockup.response.list[0].stock_id);
        done();
      },
      (err) => {
        expect(false).toBeTruthy();
      }
    );
  });

  it("Jeśli shoper zwróci informację ale bez danych towaru to zwrócić błąd z opisem że towaru nie ma w bazie shopera", (done) => {
    const shoperStockService: ShoperStockService = new ShoperStockService(Config.getInstance());

    jest.spyOn(shoperStockService, "_getAjaxStocks").mockReturnValue(
      Observable.create((observer: AnonymousSubject<any>) => {
        const emtyResponse = {
          originalEvent: null,
          xhr: null,
          request: null,
          status: null,
          response: {
            count: "1",
            pages: 1,
            page: 1,
            list: [],
          },
          responseText: null,
          responseType: null,
        };
        observer.next(emtyResponse);
        observer.complete();
      })
    );

    shoperStockService.getStock(stringGenerator(), stringGenerator()).subscribe(
      (val: ShoperStock) => {
        return;
      },
      (err) => {
        expect(err.constructor.name).toBe("ErrorInTask");
        expect(err.errorType).toBe(ErrorType.ITEM_NOT_FOUND_IN_SHOPER);
        done();
      }
    );
  });

  it("Jeśli podczas próby połączenia nie otrzymamy odpowiedzi w ciągu określonego czasu powinniśmy zwracać błąd", (done) => {
    const config: Config = Config.getInstance();
    const errorDelayTIme = 500;
    config.errorDelayTime = errorDelayTIme;
    const shoperStockService: ShoperStockService = new ShoperStockService(config);

    jest.spyOn(shoperStockService, "_getAjaxStocks").mockReturnValue(
      Observable.create((observer: AnonymousSubject<any>) => {
        return;
      })
    );
    const startTime = Date.now();

    shoperStockService.getStock(stringGenerator(), stringGenerator()).subscribe(
      (val: ShoperStock) => {
        return;
      },
      (err) => {
        expect(startTime + errorDelayTIme).toBeLessThanOrEqual(Date.now());
        expect(err.name).toBe("TimeoutError");
        done();
      }
    );
  });
});
