import { Config } from "../config/config";
import Sqlite = require("better-sqlite3");
import { getLogger } from "log4js";

const logger = getLogger();
export class SQLiteService {
  private static instance: SQLiteService;
  config: Config;
  static database: Sqlite.Database;
  constructor() {
    this.config = Config.getInstance();
    if (SQLiteService.database) {
      SQLiteService.database = new Sqlite(this.config.database.fileName || "database.db", { verbose: logger.debug });
    }
  }

  static getInstance(): SQLiteService {
    if (!SQLiteService.instance) {
      SQLiteService.instance = new SQLiteService();
    }
    return SQLiteService.instance;
  }


}
