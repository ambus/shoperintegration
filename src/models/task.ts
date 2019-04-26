import { FilonMerchandise } from "./filon-merchandise";

export type Task = {
    id: string;
    filonMerchandise: FilonMerchandise;
    attemptCounter: number;
    lastAttemptTime: number;
}