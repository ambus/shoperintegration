import { Task } from "./task";
import { TaskShoperRequestStatusValue } from "./task-shoper-request-status-value";
import { FilonMerchandise } from "./filon-merchandise";

export class ErrorTask implements Task {
  id: string;
  filonMerchandise: FilonMerchandise;
  status: TaskShoperRequestStatusValue;
  attemptCounter: number;
  lastAttemptTime: number;
  endTime: number;
  shoperConnectionTokenID: string;
  message: string;

  constructor(task: Task, message: string) {
    this.id = task.id;
    this.filonMerchandise = task.filonMerchandise;
    this.status = TaskShoperRequestStatusValue.error;
    this.attemptCounter = task.attemptCounter;
    this.lastAttemptTime = new Date().getTime();
    this.endTime = task.endTime;
    this.shoperConnectionTokenID = task.shoperConnectionTokenID;
    this.message = message;
  }
}
