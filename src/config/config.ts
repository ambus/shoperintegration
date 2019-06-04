import { Configuration } from "log4js";
import * as fs from "fs";
import { ConfigElement } from "../models/config-element";
import { ParserOptions } from "../models/parser-options";
import { FileInfo } from "../models/file-info";
import { ShoperConfig } from "../models/shoper-config";
import { SMTPConfig } from "../models/smtp-config";
import { emailNoticication } from "../models/email-notifications-list";
import { BackupConfig } from "../models/backup-config";

export const DEFAULT_CONFIG_FILE_PATH = "config.json";

export class Config {
  private static instance: Config;
  public log4js: Configuration;
  public configurationType: string;
  public static filePath: string;
  public encoding: string;
  public parserOptions: ParserOptions;
  public fileInfo: FileInfo;
  public errorDelayTime: number;
  public attempsWhenError: number;
  public shoperConfig: ShoperConfig;
  public smtpConfig: SMTPConfig;
  public emailNoticication: emailNoticication;
  public backup: BackupConfig;

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
      this.fileInfo = config.fileInfo;
      this.errorDelayTime = config.errorDelayTime;
      this.attempsWhenError = config.attempsWhenError;
      this.shoperConfig = config.shoperConfig;
      this.smtpConfig = config.smtpConfig;
      this.emailNoticication = config.emailNoticication;
      this.backup = config.backup;
    } catch (err) {
      console.error(`Napotkano błąd podczas pobierania konfiguracji. Próbowano odnaleść plik konfiguracyjny pod adresem ${DEFAULT_CONFIG_FILE_PATH}. Ustawiono domyślną konfigurację`, err);
      let config = this.loadDefaultConfiguration();
      this.log4js = config.log4js;
      this.configurationType = config.configurationType;
      this.encoding = config.encoding;
      this.parserOptions = config.parserOptions;
      this.fileInfo = config.fileInfo;
      this.errorDelayTime = config.errorDelayTime;
      this.attempsWhenError = config.attempsWhenError;
      this.shoperConfig = config.shoperConfig;
      this.smtpConfig = config.smtpConfig;
      this.emailNoticication = config.emailNoticication;
      
      this.backup = config.backup;
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
      configurationType: "default",
      fileInfo: {
        path: "tmp",
        fileName: "test.csv"
      },
      errorDelayTime: 5000,
      attempsWhenError: 5,
      shoperConfig: {
        urls: {
          token: "",
          productStocks: "",
          products: "",
          productStocksUpdate: ""
        },
        userToken: "",
        delayTimeInMilisec: 800,
        maxRetryAttempts: 3
      },
      smtpConfig: {
        from: "",
        host: "",
        port: 587,
        auth: {
          user: "",
          pass: ""
        },
        ignoreTLS: true,
        tls: {
          ciphers: "SSLv3"
        },
        status: false
      },
      emailNoticication: {
        alerts: [],
        adminsNotifications: [],
        sendNotificationToErrorTypes: ["undefined", "update_errror"]
      },
      backup: {
        filelocation: "./",
        status: false
      }
    };
  }
}
