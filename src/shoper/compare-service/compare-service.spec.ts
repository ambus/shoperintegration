import { of } from "rxjs";
import { taskMockup } from "../../../test/mockup/task.mockup";
import { CompareService } from "./compare-service";
import { Task } from "../../models/task";

describe("compareService", () => {
  let compareService = new CompareService();
  it("po przejściu przez strumień powinien zostać zwrócony obiekt Task z parametrem stockToUpdate i ilością taką jak w filonMerchandiseItem", () => {
    let taskMock = taskMockup;
    let stock = Math.round(Math.random() * 100);
    taskMock.filonMerchandise.stock = stock;
    of(taskMockup)
      .pipe(compareService.generateItemToUpdate())
      .subscribe((task: Task) => {
        expect(task.stockToUpdate).toBeDefined();
        expect(task.stockToUpdate.stock).toBe(stock.toString());
      });
  });
});
