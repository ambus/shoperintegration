import { Task } from "./task";
import { TaskShoperRequestStatusValue } from "./task-shoper-request-status-value";
import { FilonMerchandise } from "./filon-merchandise";
import { ShoperStock } from "./shoper-stock";
import { ErrorType } from "./error-type";

export class ErrorTask implements Task {
  id: string;
  errorType: ErrorType;
  filonMerchandise: FilonMerchandise;
  status: TaskShoperRequestStatusValue;
  attemptCounter: number;
  lastAttemptTime: number;
  endTime: number;
  shoperConnectionTokenID: string;
  message: string;
  shoperStock: ShoperStock;

  constructor(task: Task, message: string, errorType: ErrorType = ErrorType.UNDEFINED) {
    this.id = task.id;
    this.filonMerchandise = task.filonMerchandise;
    this.status = TaskShoperRequestStatusValue.error;
    this.attemptCounter = task.attemptCounter;
    this.lastAttemptTime = new Date().getTime();
    this.endTime = task.endTime;
    this.shoperConnectionTokenID = task.shoperConnectionTokenID;
    this.message = message;
    this.shoperStock = task.shoperStock;
    this.errorType = errorType;
  }
}
