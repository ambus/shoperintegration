import { Configuration } from "log4js";

export type ConfigElement = {
    log4js: Configuration;
    encoding: string,
    configurationType: string 
}