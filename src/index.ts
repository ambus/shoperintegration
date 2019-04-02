import { configure, getLogger, Configuration } from "log4js";
import * as fs from "fs";
import * as path from "path";
import { Config } from "./models/config";

const CONFIG_FILE_NAME = "config.json";
var config: Config;

try {
  config = JSON.parse(fs.readFileSync(CONFIG_FILE_NAME, "utf8"));
} catch (err) {
  console.error(`Napotkano błąd podczas pobierania konfiguracji. Próbowano odnaleść plik konfiguracyjny pod adresem ${CONFIG_FILE_NAME}. Ustawiono domyślną konfigurację`, err);
  config = {
    log4js: {
      appenders: {
        out: { type: "stdout" }
      },
      categories: {
        default: { appenders: ["out"], level: "trace" }
      }
    }
  };
}

configure(config.log4js);

const logger = getLogger();

export function init() {
  logger.trace("Start serwisu shoperintergration");
}

init();
