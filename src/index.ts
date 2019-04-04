import { configure, getLogger, Logger } from "log4js";
import { Config } from "./config/config";

export const CONFIG_FILE_NAME = "config.json";
export var config: Config;
export var logger: Logger;

export function init() {
  config = Config.getInstance(CONFIG_FILE_NAME);
  configure(config.log4js);
  logger = getLogger();
  logger.trace("Start serwisu shoperintergration");
}

init();
