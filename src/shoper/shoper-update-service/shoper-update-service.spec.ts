import { ShoperUpdateService } from "./shoper-update-service";
import { Config } from "../../config/config";
import { stringGenerator } from "../../lib/string-generator";
import { AjaxResponse } from "rxjs/ajax";
import { mockup_pushAjaxShoperUpdate } from "../../../test/mockup/shoper-update.mockup";
import { Task } from "../../models/task";
import { TaskShoperRequestStatusValue } from "../../models/task-shoper-request-status-value";
import { shoperStockMockup } from "../../../test/mockup/shoper-stock.mockup";
import { taskMockup } from "../../../test/mockup/task.mockup";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { Observable, of, throwError } from "rxjs";
import { map } from "rxjs/operators";

describe("shoperUpdateService", () => {
  let shoperUpdateService: ShoperUpdateService;

  beforeAll(() => {
    shoperUpdateService = new ShoperUpdateService(Config.getInstance());
    mockup_pushAjaxShoperUpdate(shoperUpdateService);
  });

  it("funkcja _pushAjaxShoperUpdate musi zwrócić obiekt AjaxRequest", () => {
    expect(shoperUpdateService._pushAjaxShoperUpdate).toBeDefined();
  });

  it("_getAjaxStocks zwraca obiekt AjaxResponse z obiektem ShoperReturnList z listą obiektów ShoperStock", done => {
    shoperUpdateService._pushAjaxShoperUpdate(stringGenerator(), taskMockup).subscribe((observer: AjaxResponse) => {
      expect(observer.response).toBeDefined();
      expect(observer.response).toBe(1);
      done();
    });
  });

  it("funkcja updateStock musi zwracać obiekt Observable z statusem aktualizacji", done => {
    shoperUpdateService.updateStock(stringGenerator(), taskMockup).subscribe((observer: number) => {
      expect(observer).toBeDefined();
      expect(observer).toBe(1);
      done();
    });
  });

  it("w strumieniu z taskiem powinna zostać dodana informacja z powodzeniem wykonania zadania", done => {
    of(taskMockup)
      .pipe(shoperUpdateService.updateShoperStock())
      .subscribe((task: Task) => {
        expect(task).toBeDefined();
        expect(task.updateStatus).toBe(1);
        done();
      });
  });
});

describe("shoperUpdateService - błędy połączenia", () => {
  it("jeśli funkcja napotka błąd podczas próby dokonania aktualizacji to powinna ponowić próbę połączenia określoną ilość razy z zadanymi przerwami i zwrócić błąd jeśli błędy się powtarzają", done => {
    let config = Config.getInstance();
    config.shoperConfig.delayTimeInMilisec = 50;
    let shoperUpdateService: ShoperUpdateService = new ShoperUpdateService(Config.getInstance());

    let errorObject = {
      error: "server_error",
      error_description: "Decoding failed: Syntax error"
    };
    let counter = -1;
    jest.spyOn(shoperUpdateService, "_pushAjaxShoperUpdate").mockReturnValue(
      Observable.create((observer: AnonymousSubject<any>) => {
        counter++;
        observer.error(errorObject);
      })
    );

    of(taskMockup)
      .pipe(shoperUpdateService.updateShoperStock())
      .subscribe(
        (task: Task) => {},
        err => {
          expect(err).toBeDefined();
          expect(counter).toBe(3);
          expect(err.error).toBe(errorObject);
          done();
        }
      );
  });
  it("jeśli funkcja napotka błąd podczas próby dokonania aktualizacji to powinna ponowić próbę połączenia określoną ilość razy z zadanymi przerwami i zwrócić błąd jeśli błędy się powtarzają", done => {
    let shoperUpdateService: ShoperUpdateService = new ShoperUpdateService(Config.getInstance());

    let errorObject = {
      error: "server_error",
      error_description: "Decoding failed: Syntax error"
    };
    let counter = -1;
    jest.spyOn(shoperUpdateService, "_pushAjaxShoperUpdate").mockReturnValue(
      Observable.create((observer: AnonymousSubject<any>) => {
        counter++;
        observer.error(errorObject);
      })
    );

    shoperUpdateService.updateStock(stringGenerator(), taskMockup).subscribe(
      (observer: number) => {},
      err => {
        expect(counter).toBe(3);
        expect(err.error).toBe(errorObject);
        done();
      }
    );
  });

  it("jeśli funkcja napotka błąd podczas próby pobrania tokena to powinna ponowić próbę połączenia określoną ilość razy z zadanymi przerwami i w 3 próbie prawidłowo wykonać zadanie", done => {
    let shoperUpdateService: ShoperUpdateService = new ShoperUpdateService(Config.getInstance());

    let errorObject = {
      error: "server_error",
      error_description: "Decoding failed: Syntax error"
    };
    let counter = -1;
    jest.spyOn(shoperUpdateService, "_pushAjaxShoperUpdate").mockReturnValue(
      Observable.create((observer: AnonymousSubject<any>) => {
        counter++;
        if (counter < 3) {
          observer.error(errorObject);
        } else {
          observer.next(taskMockup);
          observer.complete();
        }
      })
    );

    of(taskMockup)
      .pipe(shoperUpdateService.updateShoperStock())
      .subscribe(
        (task: Task) => {
          expect(counter).toBe(3);
          task.id = stringGenerator();
          expect(task.id).toBe(taskMockup.id);
          done();
        },
        err => {
          expect(false).toBeTruthy();
        }
      );
  });

  it("eśli podczas próby połączenia nie otrzymamy odpowiedzi w ciągu określonego czasu powinniśmy zwracać błąd", done => {
    let config: Config = Config.getInstance();
    const errorDelayTIme = 500;
    config.errorDelayTime = errorDelayTIme;
    let shoperUpdateService: ShoperUpdateService = new ShoperUpdateService(config);

    jest.spyOn(shoperUpdateService, "_pushAjaxShoperUpdate").mockReturnValue(Observable.create((observer: AnonymousSubject<any>) => {}));
    const startTime = Date.now();

    shoperUpdateService.updateStock(stringGenerator(), taskMockup).subscribe(
      (observer: number) => {},
      err => {
        expect(startTime + errorDelayTIme).toBeLessThanOrEqual(Date.now());
        expect(err.error.name).toBe("TimeoutError");
        done();
      }
    );
  });
});
