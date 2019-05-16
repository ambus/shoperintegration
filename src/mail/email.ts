import { Config } from "../config/config";
import Mail = require("nodemailer/lib/mailer");
import SMTPTransport = require("nodemailer/lib/smtp-transport");
import { Observable } from "rxjs";
import { AnonymousSubject } from "rxjs/internal/Subject";
import smtpTransport = require("nodemailer-smtp-transport");
import nodemailer = require("nodemailer");
import { Logger, getLogger } from "log4js";

export class EMail {
  transporter: Mail;
  logger: Logger;

  constructor(config: Config) {
    (this.logger = getLogger("EMail")),
      (this.transporter = nodemailer.createTransport(
        smtpTransport({
          host: config.smtpConfig.host,
          secure: config.smtpConfig.secure,
          port: config.smtpConfig.port,
          auth: config.smtpConfig.auth,
          // ignoreTLS: false,
          tls: config.smtpConfig.tls
        })
      ));
  }

  sendMail(subject: string = "Wiadomość od boota serwisu ShoperService", message: string = "Cześć 😀", messageHtml: string = "", mailTo: Array<string> = [""], ...args: any) {
      const mailOptions: Mail.Options = {
        from: "ERP - ShoperService boot 👻<erp-helpdesk@kim24.pl>",
        to: mailTo,
        subject: subject,
        text: message,
        html: messageHtml
      };
      this.transporter.sendMail(mailOptions, (err, info: SMTPTransport.SentMessageInfo) => {
        if (err) {
          this.logger.error("Błąd podczas wysyłania maila", err);
        } else {
          this.logger.log(`Wysłano wiadomość: ${subject} do ${mailTo}. Status: `, info);
        }
      });
  }

  sendMailObservable(subject: string = "Wiadomość od boota serwisu ShoperService", message: string = "Cześć 😀", messageHtml: string = "", mailTo: Array<string> = [""], ...args: any): Observable<SMTPTransport.SentMessageInfo> {
    return Observable.create((observer: AnonymousSubject<SMTPTransport.SentMessageInfo>) => {
      const mailOptions: Mail.Options = {
        from: "ERP - ShoperService boot 👻<erp-helpdesk@kim24.pl>",
        to: mailTo,
        subject: subject,
        text: message,
        html: messageHtml
      };
      this.transporter.sendMail(mailOptions, (err, info: SMTPTransport.SentMessageInfo) => {
        if (err) {
          this.logger.error("Błąd podczas wysyłania maila", err);
          observer.error(err);
        } else {
          this.logger.log(`Wysłano wiadomość: ${subject} do ${mailTo}. Status: `, info);
          observer.next(info);
          observer.complete();
        }
      });
    });
  }
}
