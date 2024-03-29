import * as fs from "fs";
import { Configuration } from "log4js";
import { BackupConfig } from "../models/backup-config";
import { ConfigElement } from "../models/config-element";
import { EmailNoticication } from "../models/email-notifications-list";
import { FileInfo } from "../models/file-info";
import { ParserOptions } from "../models/parser-options";
import { ShoperConfig } from "../models/shoper-config";
import { SMTPConfig } from "../models/smtp-config";

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
  public emailNoticication: EmailNoticication;
  public backup: BackupConfig;
  public timeout: number;

  private constructor(private fileLocation: string) {
    this.loadConfiguration(fileLocation);
  }

  static getInstance(fileLocation: string = DEFAULT_CONFIG_FILE_PATH) {
    if (!Config.instance || (fileLocation !== this.filePath && fileLocation !== DEFAULT_CONFIG_FILE_PATH)) {
      Config.instance = new Config(fileLocation);
      this.filePath = fileLocation;
    }
    return Config.instance;
  }

  public loadConfiguration(filePath: string): void {
    let config: ConfigElement = this.loadDefaultConfiguration();
    try {
      config = JSON.parse(fs.readFileSync(filePath, "utf8"));
      this.configurationType = `File ${filePath}`;
    } catch (err) {
      console.error(`Napotkano błąd podczas pobierania konfiguracji. Próbowano odnaleść plik konfiguracyjny pod adresem ${DEFAULT_CONFIG_FILE_PATH}. Ustawiono domyślną konfigurację`, err);
    }
    this.log4js = config.log4js;
    this.configurationType = this.configurationType ?? config.configurationType;
    this.encoding = config.encoding;
    this.parserOptions = config.parserOptions;
    this.fileInfo = config.fileInfo;
    this.errorDelayTime = config.errorDelayTime;
    this.attempsWhenError = config.attempsWhenError;
    this.shoperConfig = config.shoperConfig;
    this.smtpConfig = config.smtpConfig;
    this.emailNoticication = config.emailNoticication;
    this.backup = config.backup;
    this.timeout = config.timeout;
  }

  public loadDefaultConfiguration(): ConfigElement {
    return {
      log4js: {
        appenders: {
          out: { type: "stdout" },
        },
        categories: {
          default: { appenders: ["out"], level: "trace" },
        },
      },
      encoding: "utf8",
      parserOptions: {
        delimiter: ";",
        columns: true,
        skip_empty_lines: true,
        skip_lines_with_error: true,
        trim: true,
        cast: true,
      },
      configurationType: "default",
      fileInfo: {
        path: "tmp",
        fileName: "test.csv",
      },
      errorDelayTime: 5000,
      attempsWhenError: 5,
      shoperConfig: {
        urls: {
          token: "",
          productStocks: "",
          products: "",
          productStocksUpdate: "",
        },
        userToken: "",
        delayTimeInMilisec: 800,
        maxRetryAttempts: 3,
      },
      smtpConfig: {
        from: "",
        host: "",
        port: 587,
        auth: {
          user: "",
          pass: "",
        },
        ignoreTLS: true,
        tls: {
          ciphers: "SSLv3",
        },
        status: false,
      },
      emailNoticication: {
        alerts: [],
        adminsNotifications: [],
        sendNotificationToErrorTypes: ["undefined", "update_errror"],
      },
      backup: {
        filelocation: "./",
        status: false,
      },
      timeout: 100,
    };
  }
}
