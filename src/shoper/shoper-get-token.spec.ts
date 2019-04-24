import { Config } from "../config/config";
import { ShoperGetToken } from "./shoper-get-token";
import { ajax, AjaxResponse } from "rxjs/ajax";
import { of } from "rxjs";

let mockupData: AjaxResponse = {
  originalEvent: null,
  xhr: null,
  request: null,
  status: null,
  response: {
    access_token: "f598c91604ca03b8c4297bb8719bfa6bbd1f760a",
    expires_in: 2592000,
    token_type: "bearer"
  },
  responseText: null,
  responseType: null
};
jest.mock("rxjs/ajax", () => ({
  ajax: jest.fn(() => of(mockupData))
}));

describe("shoperGetToken", () => {
  it("powinien zwracać string z tokenem", done => {
    ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, true).subscribe((val: string) => {
      expect(val).toBeDefined();
      done();
    });
  });
});
