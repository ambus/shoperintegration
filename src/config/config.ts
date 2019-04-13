import { Configuration } from "log4js";
import * as fs from "fs";
import { ConfigElement } from "../models/config-element";
import { ParserOptions } from "../models/parser-options";

export const DEFAULT_CONFIG_FILE_PATH = "config.json";

export class Config {
  private static instance: Config;
  public log4js: Configuration;
  public configurationType: string;
  public static filePath: string;
  public encoding: string;
  public parserOptions: ParserOptions;

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
      this.encoding = config.encoding;
      this.parserOptions = config.parserOptions;
    } catch (err) {
      console.error(`Napotkano błąd podczas pobierania konfiguracji. Próbowano odnaleść plik konfiguracyjny pod adresem ${DEFAULT_CONFIG_FILE_PATH}. Ustawiono domyślną konfigurację`, err);
      let config = this.loadDefaultConfiguration();
      this.log4js = config.log4js;
      this.configurationType = config.configurationType;
      this.encoding = config.encoding;
      this.parserOptions = config.parserOptions;
    }
  }

  public loadDefaultConfiguration(): ConfigElement {
    return {
      log4js: {
        appenders: {
          out: { type: "stdout" }
        },
        categories: {
          default: { appenders: ["out"], level: "trace" }
        }
      },
      encoding: "utf8",
      parserOptions: {
        delimiter: ";",
        columns: true,
        skip_empty_lines: true,
        skip_lines_with_error: true,
        trim: true,
        cast: true
      },
      configurationType: "default"
    };
  }
}
