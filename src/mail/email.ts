import { Config } from "../config/config";
import { createTransport } from "nodemailer";
import Mail = require("nodemailer/lib/mailer");
import SMTPTransport = require("nodemailer/lib/smtp-transport");
import { Observable } from "rxjs";
import { AnonymousSubject } from "rxjs/internal/Subject";

export class EMail {
  transporter: Mail;

  constructor(config: Config) {
    this.transporter = createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "test", // generated ethereal user
        pass: "test" // generated ethereal password
      }
    });
  }

  sendMail(message: string, ...args: any): Observable<SMTPTransport.SentMessageInfo> {
    return Observable.create((observer: AnonymousSubject<SMTPTransport.SentMessageInfo>) => {
      // setup email data with unicode symbols
      const mailOptions: Mail.Options = {
        from: '"ShoperService 👻" <s.standarski@kim24.pl>', // sender address
        to: "", // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>" // html body
      };

      // send mail with defined transport object
      this.transporter.sendMail(mailOptions, (err, info: SMTPTransport.SentMessageInfo) => {
        if (err) {
          console.log(err);
          observer.error(err);
        }
        console.log("Message sent: %s", info.messageId);
        observer.next(info);
        observer.complete();

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@blurdybloop.com>
      });
    });
  }
}
