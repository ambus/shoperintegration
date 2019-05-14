import { createTaskRequest } from "./create-task-request";
import { FilonMerchandise } from "../../models/filon-merchandise";
import { stringGenerator } from "../../lib/string-generator";
describe("createTaskRequest", () => {
  it("po przekazaniu do funkcji obiektu typu filonMerchandise powinien zwrócić obiekt typu Task", () => {
    let filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: 1, price: "16.00" };
    let task = createTaskRequest(filonMerchandise);
    expect(task.id).toBeDefined();
    expect(task.id.length).toBeGreaterThan(5);
    expect(task.filonMerchandise.product_code).toEqual(filonMerchandise.product_code);
    expect(task.filonMerchandise.stock).toEqual(filonMerchandise.stock);
    expect(task.filonMerchandise.price).toEqual(filonMerchandise.price);
    expect(task.attemptCounter).toEqual(0);
    expect(task.lastAttemptTime).toBeUndefined();
  });
});
