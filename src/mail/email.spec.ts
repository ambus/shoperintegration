import { EMail } from "./email";
import { Config } from "../config/config";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";
import { AnonymousSubject } from "rxjs/internal/Subject";
import * as Mail from "nodemailer/lib/mailer";

const TEST_CONFIG_FILE_PATH = "configForTests.json";

describe("email", () => {
  let email: EMail;

  beforeAll(() => {
    email = new EMail(Config.getInstance(TEST_CONFIG_FILE_PATH));
  });

  it("funkcja sendMail powinna wywoływać jej kopię ale implementującą strumienie", () => {
    const spySendMail = jest.spyOn(email, "sendMailObservable");
    email._config.smtpConfig.status = true;
    email.sendMail("Wiadomość :)");
    expect(spySendMail).toBeCalled();
  });

  it("w przypadku powodzenia w strumieniu powinna pojawić się informacja że prawidłowo wysłano email", (done) => {
    const spySendMail = jest
      .spyOn(email, "_transporterSendMail")
      .mockImplementation((mailOptions: Mail.Options, observer: AnonymousSubject<SMTPTransport.SentMessageInfo>) => {
        observer.next({} as SMTPTransport.SentMessageInfo);
      });
    email.sendMailObservable("Wiadomość :)", "Wiadomość", "", ["test@test.com"]).subscribe((val: SMTPTransport.SentMessageInfo) => {
      expect(spySendMail).toBeCalled();
      expect(val).toBeUndefined();
      done();
    });
  });

  it("w przypadku pustej listy adresów funkcja sendMailObservable musi zwrócić błąd ", (done) => {
    const spySendMail = jest
      .spyOn(email, "_transporterSendMail")
      .mockImplementation((mailOptions: Mail.Options, observer: AnonymousSubject<SMTPTransport.SentMessageInfo>) => {
        observer.next({} as SMTPTransport.SentMessageInfo);
      });
    email.sendMailObservable("Wiadomość :)", "Wiadomość", "", []).subscribe(
      (val: SMTPTransport.SentMessageInfo) => {
        return;
      },
      (err) => {
        expect(spySendMail).toBeCalled();
        expect(err).toBe("Brak odbiorców wiadomości");
        done();
      }
    );
  });
});
