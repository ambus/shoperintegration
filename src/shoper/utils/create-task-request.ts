import { FilonMerchandise } from "../../models/filon-merchandise";
import { Task } from "../../models/task";
import { stringGenerator } from "../../lib/string-generator";

export const createTaskRequest: (filonMerchandise: FilonMerchandise) => Task = filonMerchandise => ({
    id: stringGenerator(),
    filonMerchandise: filonMerchandise,
    attemptCounter: 0,
    lastAttemptTime: undefined
});