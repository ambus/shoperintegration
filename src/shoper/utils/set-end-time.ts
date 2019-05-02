import { map } from "rxjs/operators";
import { Task } from "../../models/task";
export const setEndTime = () =>
  map(
    (request: Task): Task => ({
      ...request,
      endTime: new Date().getTime()
    })
  );
