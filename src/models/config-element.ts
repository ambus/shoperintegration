import { Configuration } from "log4js";
import { ParserOptions } from "./parser-options";
import { FileInfo } from "./file-info";
import { ShoperConfig } from "./shoper-config";
import { SMTPConfig } from "./smtp-config";
import { EmailNoticication } from "./email-notifications-list";
import { BackupConfig } from "./backup-config";

export type ConfigElement = {
  log4js: Configuration;
  encoding: string;
  configurationType: string;
  parserOptions: ParserOptions;
  fileInfo: FileInfo;
  errorDelayTime: number;
  attempsWhenError: number;
  shoperConfig: ShoperConfig;
  smtpConfig: SMTPConfig;
  emailNoticication: EmailNoticication;
  backup: BackupConfig;
  timeout: number;
};
