import { Task } from "../../src/models/task";
import { stringGenerator } from "../../src/lib/string-generator";
import { TaskShoperRequestStatusValue } from "../../src/models/task-shoper-request-status-value";
import { shoperStockMockup } from "./shoper-stock.mockup";

export const taskMockup: Task = {
  id: stringGenerator(),
  filonMerchandise: {
    product_code: stringGenerator(),
    stock: 15,
    price: "100"
  },
  status: TaskShoperRequestStatusValue.making,
  attemptCounter: 1,
  lastAttemptTime: 1,
  endTime: 1,
  shoperConnectionTokenID: stringGenerator(),
  shoperStock: shoperStockMockup.response.list[0],
  stockToUpdate: { stock: "12" }
};