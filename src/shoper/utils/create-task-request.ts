import { FilonMerchandise } from "../../models/filon-merchandise";
import { Task } from "../../models/task";
import { stringGenerator } from "../../lib/string-generator";
import { TaskShoperRequestStatusValue } from "../../models/task-shoper-request-status-value";

export const createTaskRequest: (filonMerchandise: FilonMerchandise) => Task = filonMerchandise => ({
    id: stringGenerator(),
    filonMerchandise: filonMerchandise,
    attemptCounter: 0,
    lastAttemptTime: undefined,
    status: TaskShoperRequestStatusValue.requested,
    endTime: null,
    shoperConnectionTokenID: null
});