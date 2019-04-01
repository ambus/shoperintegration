import { configure, getLogger } from "log4js";

configure({
  appenders: {
    out: { type: "stdout" },
    app: { type: "file", filename: "log4js/shoper.log", maxLogSize: 10485760, numBackups: 3 }
  },
  categories: {
    default: { appenders: ["out", "app"], level: "trace" }
  }
});

const logger = getLogger();

export function init() {
  logger.trace("Start serwisu shoperintergration");
}

init();
