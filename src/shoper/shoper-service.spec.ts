import { Config } from "../config/config";
import { ShoperService } from "./shoper-service";
import { FilonMerchandise } from "../models/filon-merchandise";
import { stringGenerator } from "../lib/string-generator";
import { Task } from "../models/task";
import { TaskShoperRequestStatusValue } from "../models/task-shoper-request-status-value";
import { bufferCount } from "rxjs/operators";
import { OperatorFunction, of, Observable, empty, throwError } from "rxjs";
import { ShoperGetToken } from "./shoper-get-token";

describe("shoperService", () => {
  it("można utworzyć obiekt shoperService", () => {
    expect(new ShoperService(Config.getInstance())).toBeDefined();
  });

  it("można wywołać funkcję dodającą kolejne zadanie do kolejki", () => {
    let shoperService = new ShoperService(Config.getInstance());
    expect(shoperService.addTask).toBeDefined();
  });

  it("po dodaniu taska serwis powinien go przekazać do strumienia z zadaniami", done => {
    let shoperService = new ShoperService(Config.getInstance());
    let filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: 1, price: "16.00" };
    shoperService._taskRequest$.subscribe((val: Task) => {
      expect(val.filonMerchandise.product_code).toEqual(filonMerchandise.product_code);
      expect(val.id).toBeDefined();
      done();
    });
    shoperService.addTask(filonMerchandise);
  });

  it("każde zadanie powinno posiadać swoje id i status requested", done => {
    let shoperService = new ShoperService(Config.getInstance());
    let filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: 1, price: "16.00" };
    shoperService._taskRequest$.subscribe((val: Task) => {
      expect(val.id).toBeDefined();
      expect(val.id.length).toBeGreaterThan(5);
      expect(val.status).toEqual(TaskShoperRequestStatusValue.requested);
      done();
    });
    shoperService.addTask(filonMerchandise);
  });

  it("każde zadanie po dodaniu i zwolnieniu kolejki powinno się pojawic w strumieniu wykonywanych zadań", done => {
    let shoperService = new ShoperService(Config.getInstance());
    let filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: 1, price: "16.00" };
    shoperService.doneTask$.subscribe((val: Task) => {
      expect(val.id).toBeDefined();
      expect(val.id.length).toBeGreaterThan(5);
      expect(val.status).toEqual(TaskShoperRequestStatusValue.done);
      done();
    });
    shoperService.addTask(filonMerchandise);
  });

  it("jak zostanie dodanych kilka tasków od razu to mają być one wykonane jeden po drugim z przerwą pomiędzy połączeniami", done => {
    let shoperService = new ShoperService(Config.getInstance());
    shoperService.doneTask$.pipe(bufferCount(3)).subscribe((val: Task[]) => {
      expect(val[0].endTime + shoperService.config.shoperConfig.delayTimeInMilisec).toBeLessThanOrEqual(val[1].endTime);
      expect(val[1].endTime + shoperService.config.shoperConfig.delayTimeInMilisec).toBeLessThanOrEqual(val[2].endTime);
      done();
    });
    for (let index = 0; index < 3; index++) {
      let filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: 1 + index, price: (6 + index).toString() };
      shoperService.addTask(filonMerchandise);
    }
  });

  it("powinien zostać pobrany token służący do autoryzacji połączenia i przekazany do funkcji makeTask", done => {
    let shoperService = new ShoperService(Config.getInstance());
    shoperService.doingTask$.subscribe((val: Task) => {
      expect(val.shoperConnectionTokenID.length).toBeGreaterThan(1);
      done();
    });
    let filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: 1, price: "16.00" };
    shoperService.addTask(filonMerchandise);
  });

  //jeśli nie można wykonać zadania to ponowić próbę jego wykonania 3 krotnie
  //  - jesli próba nie uda się 3 krotnie to wysłać powiadomienie na @
  //pobranie towaru znajdującego się w bazie shopera - do porównania
  //  - jeśli nie można pobrać to czy próba jest ponawiana 3 razy
  //  - jesli jest błąd to wysłać powiadomienie o błędzie

  //porównanie towaru z filona z towarem shopera

  //jeśli są róznice to wysłać nowe dane do shopera
});
