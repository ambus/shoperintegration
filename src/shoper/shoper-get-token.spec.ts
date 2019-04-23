import { Config } from "../config/config";
import { ShoperGetToken } from "./shoper-get-token";

describe("shoperGetToken", () => {
  it("powinien zwracać string z tokenem", done => {
    ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, true).subscribe((val: string) => {
      expect(val).toBeDefined();
      done();
    });
  });
});
