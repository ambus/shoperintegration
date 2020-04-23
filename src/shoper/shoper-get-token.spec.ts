import { Observable } from "rxjs";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { mockupData_shoperGetToken, mockup_shoperGetToken } from "../../test/mockup/shoper-get-token.mockup";
import { Config } from "../config/config";
import { stringGenerator } from "../lib/string-generator";
import { ShoperGetToken } from "./shoper-get-token";

beforeEach(() => {
  jest.clearAllMocks();
});
describe("shoperGetToken", () => {
  beforeAll(() => {
    mockup_shoperGetToken();
  });

  it("powinien zwracać string z tokenem", (done) => {
    ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, true).subscribe((val: string) => {
      expect(val).toBeDefined();
      done();
    });
  });

  it("przy drugim wywołaniu powinna zwrócić ten sam token", (done) => {
    ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, true).subscribe((val: string) => {
      expect(val).toBeDefined();
      mockupData_shoperGetToken.response.access_token = stringGenerator();
      ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, false).subscribe((val2: string) => {
        expect(val).toEqual(val2);
        done();
      });
    });
  });

  it("przy drugim wywołaniu i refreshu powinna zwrócić nowy obiekt", (done) => {
    ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, true).subscribe((val: string) => {
      expect(val).toBeDefined();
      mockupData_shoperGetToken.response.access_token = stringGenerator();
      ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, true).subscribe((val2: string) => {
        expect(val).not.toEqual(val2);
        done();
      });
    });
  });

  it("funkcja _getAjaxConnection musi zwrócić obiekt AjaxRequest", () => {
    expect(ShoperGetToken._getAjaxConnection).toBeDefined();
  });
});

describe("shoperGetToken - błędy połączenia", () => {
  it("jeśli funkcja napotka błąd podczas próby pobrania tokena to powinna ponowić próbę połączenia określoną ilość razy z zadanymi przerwami i zwrócić błąd", (done) => {
    let errorString = "Błąd przy pobieraniu tokena";
    let counter = -1;
    jest.spyOn(ShoperGetToken, "_getAjaxConnection").mockReturnValue(
      Observable.create((observer: AnonymousSubject<any>) => {
        counter++;
        observer.error(errorString);
      })
    );

    ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, true, 200, 3).subscribe(
      (val: string) => {},
      (err) => {
        expect(counter).toBe(3);
        expect(err.message).toBe("Napotkano błąd podczas pobierania tokena uwierzytelniającego");
        done();
      }
    );
  });

  it("Jeśli podczas próby połączenia nie otrzymamy odpowiedzi w ciągu określonego czasu powinniśmy zwracać błąd", (done) => {
    jest.spyOn(ShoperGetToken, "_getAjaxConnection").mockReturnValue(Observable.create((observer: AnonymousSubject<any>) => {}));
    const startTime = Date.now();

    const delayTimeInMilisec = 50;
    const maxRetryAttempts = 3;

    ShoperGetToken.getToken(Config.getInstance().shoperConfig.userToken, true, delayTimeInMilisec, maxRetryAttempts).subscribe(
      (val: string) => {},
      (err) => {
        expect(startTime + delayTimeInMilisec + delayTimeInMilisec * maxRetryAttempts).toBeLessThan(Date.now());
        expect(err.error.name).toBe("TimeoutError");
        done();
      }
    );
  });
});
