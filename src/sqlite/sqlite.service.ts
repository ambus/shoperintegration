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
    if (!SQLiteService.database) {
      SQLiteService.database = new Sqlite(this.config.database.fileName || "database.db", { memory: this.config.database.memory, verbose: console.warn });
    }
  }

  static getInstance(): SQLiteService {
    if (!SQLiteService.instance) {
      SQLiteService.instance = new SQLiteService();
    }
    return SQLiteService.instance;
  }

  //   checkThatTableIsExist

  createTable(tableNameWithParams: string): boolean {
    try {
      SQLiteService.database.exec(`CREATE TABLE ${tableNameWithParams};`);
      return true;
    } catch (err) {
      logger.error("Błąd podczas próby utworzenia nowej bazy danych.", err);
      return false;
    }
  }

  dropTable(tablename: string): boolean {
    try {
      SQLiteService.database.exec(`DROP TABLE ${tablename};`);
      return true;
    } catch (err) {
      logger.error("Błąd podczas próby usuwania bazy danych.", err);
      return false;
    }
  }
}
