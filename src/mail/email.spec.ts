import { EMail } from "./email";
import { Config } from "../config/config";

describe("email", () => {
  let email = new EMail(Config.getInstance());
  it("Powinno wysłać maila", done => {
    email.sendMail("Wiadomość :)").subscribe(status => {
      console.error(status);
    });
  });
});
