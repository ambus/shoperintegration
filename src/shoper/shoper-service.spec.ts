import { Observable } from "rxjs";
import { bufferCount } from "rxjs/operators";
import { Config } from "../config/config";
import { stringGenerator } from "../lib/string-generator";
import { FilonMerchandise } from "../models/filon-merchandise";
import { Task } from "../models/task";
import { TaskShoperRequestStatusValue } from "../models/task-shoper-request-status-value";
import { ShoperService } from "./shoper-service";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { ShoperStock } from "../models/shoper-stock";
import { shoperStockMockup, mockup_getAjaxStock, shoperAuthenticationErrorResponse } from "../../test/mockup/shoper-stock.mockup";
import { mockup_shoperGetToken } from "../../test/mockup/shoper-get-token.mockup";
import { mockup_pushAjaxShoperUpdate } from "../../test/mockup/shoper-update.mockup";
import { ErrorType } from "../models/error-type";
import { ErrorInTask } from "../models/error-in-task";

const TEST_CONFIG_FILE_PATH = "configForTests.json";

describe("shoperService", () => {
  let shoperService: ShoperService;
  beforeEach(() => {
    mockup_shoperGetToken();
    shoperService = new ShoperService(Config.getInstance(TEST_CONFIG_FILE_PATH));
    shoperService.shoperStockService;
    mockup_getAjaxStock(shoperService.shoperStockService);
    mockup_pushAjaxShoperUpdate(shoperService.shoperUpdateService);
  });

  it("można utworzyć obiekt shoperService", () => {
    expect(mockup_getAjaxStock).toBeDefined();
  });

  it("można wywołać funkcję dodającą kolejne zadanie do kolejki", () => {
    expect(shoperService.addTask).toBeDefined();
  });

  it("po dodaniu taska serwis powinien go przekazać do strumienia z zadaniami", (done) => {
    const filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: 1, price: "16.00", warnLevel: 2, other_price: "11.00" };
    shoperService._taskRequest$.subscribe((val: Task) => {
      expect(val.filonMerchandise.product_code).toEqual(filonMerchandise.product_code);
      expect(val.id).toBeDefined();
      done();
    });
    shoperService.addTask(filonMerchandise);
  });

  it("każde zadanie powinno posiadać swoje id i status requested", (done) => {
    const filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: 1, price: "16.00", warnLevel: 2, other_price: "11.00" };
    shoperService._taskRequest$.subscribe((val: Task) => {
      expect(val.id).toBeDefined();
      expect(val.id.length).toBeGreaterThan(5);
      expect(val.status).toEqual(TaskShoperRequestStatusValue.requested);
      done();
    });
    shoperService.addTask(filonMerchandise);
  });

  it("każde zadanie po dodaniu i zwolnieniu kolejki powinno się pojawic w strumieniu wykonywanych zadań", (done) => {
    const filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: 1, price: "16.00", warnLevel: 2, other_price: "11.00" };
    shoperService.doneTask$.subscribe((val: Task) => {
      expect(val.id).toBeDefined();
      expect(val.id.length).toBeGreaterThan(5);
      expect(val.status).toEqual(TaskShoperRequestStatusValue.done);
      done();
    });
    shoperService.addTask(filonMerchandise);
  });

  it("jak zostanie dodanych kilka tasków od razu to mają być one wykonane jeden po drugim z przerwą pomiędzy połączeniami", (done) => {
    shoperService.doneTask$.pipe(bufferCount(3)).subscribe((val: Task[]) => {
      expect(val[0].endTime + shoperService.config.shoperConfig.delayTimeInMilisec).toBeLessThanOrEqual(val[1].endTime);
      expect(val[1].endTime + shoperService.config.shoperConfig.delayTimeInMilisec).toBeLessThanOrEqual(val[2].endTime);
      done();
    });
    for (let index = 0; index < 3; index++) {
      const filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: 1 + index, price: (6 + index).toString(), warnLevel: 2, other_price: "11.00" };
      shoperService.addTask(filonMerchandise);
    }
  });

  it("powinien zostać pobrany token służący do autoryzacji połączenia i przekazany do funkcji makeTask", (done) => {
    shoperService.doingTask$.subscribe((val: Task) => {
      expect(val.shoperConnectionTokenID.length).toBeGreaterThan(1);
      done();
    });
    const filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: 1, price: "16.00", warnLevel: 2, other_price: "11.00" };
    shoperService.addTask(filonMerchandise);
  });

  it("po pobraniu tokena musi zostać pobrana informacja z shopera na temat danego towaru", (done) => {
    shoperService.doingTask$.subscribe((val: Task) => {
      expect(val.shoperStock).toBeDefined();
      expect(val.shoperStock).toBe(shoperStockMockup.response.list[0]);
      done();
    });
    const filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: 1, price: "16.00", warnLevel: 2, other_price: "11.00" };
    shoperService.addTask(filonMerchandise);
  });

  it("po dodaniu towaru do strumienia powinien pojawić się wykonany task w strumieniu zakończonych zadań", (done) => {
    const stock = Math.round(Math.random() * 100);
    shoperService.doneTask$.subscribe((val: Task) => {
      expect(val.shoperStock).toBeDefined();
      expect(val.shoperStock).toBe(shoperStockMockup.response.list[0]);
      expect(val.shoperConnectionTokenID).toBeDefined();
      expect(val.updateStatus).toBe(1);
      expect(val?.stockToUpdate?.stock).toBe(stock.toString());
      done();
    });
    const filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: stock, price: "16.00", warnLevel: 2, other_price: "11.00" };
    shoperService.addTask(filonMerchandise);
  });
});

describe("shoperService - błędy połączenia", () => {
  it("jeśli wykonywanie zadania się nie powiedzie to należy ponowić próbę jego wykonania zgodnie w ilości podanej w konfiguracji", (done) => {
    const config = Config.getInstance();
    config.shoperConfig.delayTimeInMilisec = 50;
    const shoperServiceInside = new ShoperService(config);

    const errorString = "Błąd przy pobieraniu tokena";
    let counter = 0;

    jest.spyOn(shoperServiceInside, "getToken").mockReturnValue(
      Observable.create((observer: AnonymousSubject<any>) => {
        counter++;
        observer.error(new ErrorInTask("Napotkano błąd podczas pobierania tokena połączenia", {}, ErrorType.TOKEN_GET));
      })
    );

    const sendMail = jest.spyOn(shoperServiceInside.eMail, "sendMail");

    shoperServiceInside.doneTask$.subscribe((task: Task) => {
      expect(task.attemptCounter).toBe(config.shoperConfig.maxRetryAttempts);
      expect(task.status).toBe(TaskShoperRequestStatusValue.error);
      expect(counter).toBe(3);
      expect(sendMail).toBeCalled();
      done();
    });
    const product_code = stringGenerator();

    const filonMerchandise: FilonMerchandise = { product_code: product_code, stock: 1, price: "16.00", warnLevel: 2 , other_price: "11.00"};
    shoperServiceInside.addTask(filonMerchandise);
  });

  it("jeśli podczas pobierania danych z shopera napotkamy błąd musimy ponowić próbę z odświeżonym tokenem połączenia", (done) => {
    const config = Config.getInstance();
    config.shoperConfig.delayTimeInMilisec = 50;
    const shoperService = new ShoperService(config);

    const getShoperStock = jest.spyOn(shoperService.shoperStockService, "getStock").mockReturnValue(
      Observable.create((observer: AnonymousSubject<ShoperStock>) => {
        observer.error(new ErrorInTask("Towaru nie ma w bazie danych shopera", {}, ErrorType.UNDEFINED));
      })
    );

    const sendMail = jest.spyOn(shoperService.eMail, "sendMail");

    shoperService.doneTask$.subscribe((task: Task) => {
      expect(task.attemptCounter).toBe(config.shoperConfig.maxRetryAttempts);
      expect(task.status).toBe(TaskShoperRequestStatusValue.error);
      expect(sendMail).toBeCalled();
      done();
    });
    const product_code = stringGenerator();

    const filonMerchandise: FilonMerchandise = { product_code: product_code, stock: 1, price: "16.00", warnLevel: 2, other_price: "11.00" };
    shoperService.addTask(filonMerchandise);
  });

  it("jeśli połączenie zwróci błąd 401 system powinien ponowić próbę uzyskania tokena autoryzacyjnego", (done) => {
    mockup_shoperGetToken();
    const shoperService = new ShoperService(Config.getInstance(TEST_CONFIG_FILE_PATH));
    shoperService.shoperStockService;
    let counter = 0;
    jest.spyOn(shoperService, "getToken").mockReturnValue(
      Observable.create((observer: AnonymousSubject<any>) => {
        counter++;
        observer.error(new ErrorInTask("Napotkano błąd podczas pobierania tokena połączenia", {}, ErrorType.TOKEN_GET));
      })
    );

    jest.spyOn(shoperService.shoperStockService, "_getAjaxStocks").mockReturnValue(
      Observable.create((observer: AnonymousSubject<any>) => {
        observer.next(shoperAuthenticationErrorResponse);
        observer.complete();
      })
    );

    shoperService.doneTask$.subscribe((val: Task) => {
      if (counter >= Config.getInstance().shoperConfig.maxRetryAttempts) {
        done();
      }
    });

    const product_code = stringGenerator();

    const filonMerchandise: FilonMerchandise = { product_code: product_code, stock: 1, price: "16.00", warnLevel: 2, other_price: "11.00" };
    shoperService.addTask(filonMerchandise);
  });
});
