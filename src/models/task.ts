import { FilonMerchandise } from "./filon-merchandise";
import { TaskShoperRequestStatusValue } from "./task-shoper-request-status-value";
import { ShoperStock } from "./shoper-stock";
import { StockToUpdate } from "./stock-to-update";

export type Task = {
    id: string;
    filonMerchandise: FilonMerchandise;
    status: TaskShoperRequestStatusValue;
    attemptCounter: number;
    lastAttemptTime: number;
    endTime: number;
    shoperConnectionTokenID: string;
    shoperStock: ShoperStock
    stockToUpdate?: StockToUpdate
}