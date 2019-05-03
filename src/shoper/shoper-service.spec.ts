import { Config } from "../config/config";
import { ShoperService } from "./shoper-service";
import { FilonMerchandise } from "../models/filon-merchandise";
import { stringGenerator } from "../lib/string-generator";
import { Task } from "../models/task";
import { TaskShoperRequestStatusValue } from "../models/task-shoper-request-status-value";
import { bufferCount } from "rxjs/operators";

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
      expect(val[0].endTime + shoperService.config.shoperConfig.delayTimeInMilisec ).toBeLessThanOrEqual(val[1].endTime)
      expect(val[1].endTime + shoperService.config.shoperConfig.delayTimeInMilisec ).toBeLessThanOrEqual(val[2].endTime)
      done();
    });
    for (let index = 0; index < 3; index++) {
      let filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: 1 + index, price: (6 + index).toString() };
      shoperService.addTask(filonMerchandise);
    }
  });
});
