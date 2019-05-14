import { TaskShoperRequestStatusValue } from "../../models/task-shoper-request-status-value";
import { map } from "rxjs/operators";
import { Task } from "../../models/task";
export const setStatus = (status: TaskShoperRequestStatusValue) =>
  map(
    (request: Task): Task => ({
      ...request,
      status
    })
  );
