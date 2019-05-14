import { createTaskRequest } from "./create-task-request";
import { FilonMerchandise } from "../../models/filon-merchandise";
import { stringGenerator } from "../../lib/string-generator";
import { setStatus } from "./set-status";
import { TaskShoperRequestStatusValue } from "../../models/task-shoper-request-status-value";
import { of } from "rxjs";
import { Task } from "../../models/task";

describe("setStatusToTaskRequest", () => {
  it("po przekazaniu zadania funkcja powinna ustawić zadany task i zwrócić subskrybcję", done => {
    let filonMerchandise: FilonMerchandise = { product_code: stringGenerator(), stock: 1, price: "16.00" };
    let task = createTaskRequest(filonMerchandise);
    expect(task.status).toEqual(TaskShoperRequestStatusValue.requested);
    of(task)
      .pipe(setStatus(TaskShoperRequestStatusValue.done))
      .subscribe((task: Task) => {
        expect(task.status).toEqual(TaskShoperRequestStatusValue.done);
        done();
      });
  });
});
