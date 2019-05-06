import { of, throwError } from "rxjs";
import { AjaxResponse } from "rxjs/ajax";
import { Config } from "../config/config";
import { stringGenerator } from "../lib/string-generator";
import { ShoperGetToken } from "./shoper-get-token";

let mockupData: AjaxResponse = {
  originalEvent: null,
  xhr: null,
  request: null,
  status: null,
  response: {
    access_token: stringGenerator(),
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

  // it("createXHR tworzy nowy obiekt XMLHttpRequest", () => {
  //   expect(ShoperGetToken.createXHR()).toBeDefined();
  // });

  it("przy drugim wywołaniu powinna zwrócić ten sam token", done => {
    ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, true).subscribe((val: string) => {
      expect(val).toBeDefined();
      mockupData.response.access_token = stringGenerator();
      ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, false).subscribe((val2: string) => {
        expect(val).toEqual(val2);
        done();
      });
    });
  });

  it("przy drugim wywołaniu i refreshu powinna zwrócić nowy obiekt", done => {
    ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, true).subscribe((val: string) => {
      expect(val).toBeDefined();
      mockupData.response.access_token = stringGenerator();
      ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, true).subscribe((val2: string) => {
        expect(val).not.toEqual(val2);
        done();
      });
    });
  });

  it("funkcja _getAjaxConnection musi zwrócić obiekt AjaxRequest", () => {
    expect(ShoperGetToken._getAjaxConnection).toBeDefined();
  });

  it("jeśli funkcja napotka błąd podczas próby pobrania tokena to powinna ponowić próbę połączenia określoną ilość razy z zadanymi przerwami i zwrócić błąd", done => {
    let errorString = "Błąd przy pobieraniu tokena";
    let mockFn = jest.spyOn(ShoperGetToken, "_getAjaxConnection").mockImplementation((token, refresh) => {
      return throwError(errorString);
    });
    ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, true, 200, 3).subscribe(
      (val: string) => {},
      err => {
        expect(mockFn.mock.calls.length).toBe(1);
        expect(err).toBe("Błąd przy pobieraniu tokena");
        done();
      }
    );
  });
});
