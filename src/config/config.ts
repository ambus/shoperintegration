import { Configuration } from "log4js";
import * as fs from "fs";

export const DEFAULT_CONFIG_FILE_PATH = "config.json";

export class Config {
  private static instance: Config;
  public log4js: Configuration;
  public configurationType: string;
  public static filePath: string;

  private constructor(private fileLocation: string) {
    this.loadConfiguration(fileLocation);
  }

  static getInstance(fileLocation: string = DEFAULT_CONFIG_FILE_PATH) {
    if (!Config.instance || fileLocation !== this.filePath) {
      Config.instance = new Config(fileLocation);
    }
    this.filePath = fileLocation;

    return Config.instance;
  }

  public loadConfiguration(filePath: string): void {
    try {
      let config = JSON.parse(fs.readFileSync(filePath, "utf8"));
      this.log4js = config.log4js;
      this.configurationType = `File ${filePath}`;
    } catch (err) {
      console.error(`Napotkano błąd podczas pobierania konfiguracji. Próbowano odnaleść plik konfiguracyjny pod adresem ${DEFAULT_CONFIG_FILE_PATH}. Ustawiono domyślną konfigurację`, err);
      let config = this.loadDefaultConfiguration();
      this.log4js = config.log4js;
      this.configurationType = config.configurationType;
    }
  }

  public loadDefaultConfiguration(): { log4js: Configuration; configurationType: string } {
    return {
      log4js: {
        appenders: {
          out: { type: "stdout" }
        },
        categories: {
          default: { appenders: ["out"], level: "trace" }
        }
      },
      configurationType: "default"
    };
  }
}
