import { Config } from "../config/config";
import Mail = require("nodemailer/lib/mailer");
import SMTPTransport = require("nodemailer/lib/smtp-transport");
import { Observable } from "rxjs";
import { AnonymousSubject } from "rxjs/internal/Subject";
import smtpTransport = require("nodemailer-smtp-transport");
import nodemailer = require("nodemailer");
import { Logger, getLogger } from "log4js";

export class EMail {
  private _transporter: Mail;
  private _logger: Logger;
  private _config: Config;

  constructor(config: Config) {
    this._config = config;
    (this._logger = getLogger("EMail")),
      (this._transporter = nodemailer.createTransport(
        smtpTransport({
          host: config.smtpConfig.host,
          secure: config.smtpConfig.secure,
          port: config.smtpConfig.port,
          auth: config.smtpConfig.auth,
          ignoreTLS: config.smtpConfig.ignoreTLS,
          tls: config.smtpConfig.tls
        })
      ));
  }

  sendMail(subject: string = "Wiadomość od boota serwisu ShoperService", message: string = "Cześć 😀", messageHtml: string = "", mailTo: Array<string> = [""], ...args: any) {
    if (this._config.smtpConfig.status) {
      this.sendMailObservable(subject, message, messageHtml, mailTo).subscribe();
    }
  }

  sendMailObservable(
    subject: string = "Wiadomość od boota serwisu ShoperService",
    message: string = "Cześć 😀",
    messageHtml: string = "",
    mailTo: Array<string>,
    ...args: any
  ): Observable<SMTPTransport.SentMessageInfo> {
    return Observable.create((observer: AnonymousSubject<SMTPTransport.SentMessageInfo>) => {
      if (!mailTo || mailTo.length <= 0) {
        observer.error("Brak odbiorców wiadomości");
      } else {
        const mailOptions: Mail.Options = {
          from: this._config.smtpConfig.from,
          to: mailTo,
          subject: subject,
          text: message,
          html: messageHtml
        };
        this._transporterSendMail(mailOptions, observer);
      }
    });
  }

  _transporterSendMail(mailOptions: Mail.Options, observer: AnonymousSubject<SMTPTransport.SentMessageInfo>): void {
    this._transporter.sendMail(mailOptions, (err, info: SMTPTransport.SentMessageInfo) => {
      if (err) {
        this._logger.error("Błąd podczas wysyłania maila", err);
        // observer.next(err);
        observer.complete();
      } else {
        this._logger.log(`Wysłano wiadomość: ${mailOptions.subject} do ${mailOptions.to}. Status: `, info);
        observer.next(info);
        observer.complete();
      }
    });
  }
}
