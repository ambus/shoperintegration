import { FilonMerchandise } from "./filon-merchandise";
import { TaskShoperRequestStatusValue } from "./task-shoper-request-status-value";
import { ShoperStock } from "./shoper-stock";

export type Task = {
    id: string;
    filonMerchandise: FilonMerchandise;
    status: TaskShoperRequestStatusValue;
    attemptCounter: number;
    lastAttemptTime: number;
    endTime: number;
    shoperConnectionTokenID: string;
    shoperStock: ShoperStock
}