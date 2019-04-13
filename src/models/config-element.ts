import { Configuration } from "log4js";
import { ParserOptions } from "./parser-options";

export type ConfigElement = {
    log4js: Configuration;
    encoding: string;
    configurationType: string;
    parseOptions: ParserOptions

}