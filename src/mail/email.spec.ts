import { EMail } from "./email";
import { Config } from "../config/config";
import SMTPTransport = require("nodemailer/lib/smtp-transport");
import { AnonymousSubject } from "rxjs/internal/Subject";
import Mail = require("nodemailer/lib/mailer");

describe("email", () => {
  let email: EMail;

  beforeAll(() => {
    email = new EMail(Config.getInstance());
  });

  it("funkcja sendMail powinna wywoływać jej kopię ale implementującą strumienie", () => {
    let spySendMail = jest.spyOn(email, "sendMailObservable");
    email.sendMail("Wiadomość :)");
    expect(spySendMail).toBeCalled();
  });

  it("w przypadku powodzenia w strumieniu powinna pojawić się informacja że prawidłowo wysłano email", done => {
    let spySendMail = jest.spyOn(email, "_transporterSendMail").mockImplementation((mailOptions: Mail.Options, observer: AnonymousSubject<SMTPTransport.SentMessageInfo>) => {
      observer.next(undefined);
    });
    email.sendMailObservable("Wiadomość :)", "Wiadomość", "", ["test@test.com"]).subscribe((val: SMTPTransport.SentMessageInfo) => {
      expect(spySendMail).toBeCalled();
      expect(val).toBeUndefined();
      done();
    });
  });

  it("w przypadku pustej listy adresów funkcja sendMailObservable musi zwrócić błąd ", done => {
    let spySendMail = jest.spyOn(email, "_transporterSendMail").mockImplementation((mailOptions: Mail.Options, observer: AnonymousSubject<SMTPTransport.SentMessageInfo>) => {
      observer.next(undefined);
    });
    email.sendMailObservable("Wiadomość :)", "Wiadomość", "", []).subscribe(
      (val: SMTPTransport.SentMessageInfo) => {},
      err => {
        expect(spySendMail).toBeCalled();
        expect(err).toBe("Brak odbiorców wiadomości");
        done();
      }
    );
  });
});