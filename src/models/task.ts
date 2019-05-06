import { FilonMerchandise } from "./filon-merchandise";
import { TaskShoperRequestStatusValue } from "./task-shoper-request-status-value";

export type Task = {
    id: string;
    filonMerchandise: FilonMerchandise;
    status: TaskShoperRequestStatusValue;
    endTime: number;
    shoperConnectionTokenID: string;
}