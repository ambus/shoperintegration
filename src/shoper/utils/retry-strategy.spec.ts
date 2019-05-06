import { Observable } from "rxjs";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { retryWhen } from "rxjs/operators";
import { retryStrategy } from "./retry-strategy";

describe("retryStrategy", () => {
  it("w przypadku napotkania błędu retry strategy powinien domyslnie powtórzyć próbę subskrybcji 3 razy", done => {
    let counter = -1;
    let sub: Observable<void> = Observable.create((observer: AnonymousSubject<void>) => {
      counter++;
      observer.error("Nowy błąd");
    });

    sub.pipe(retryWhen(retryStrategy())).subscribe(
      observer => {},
      err => {
        expect(counter).toBe(3);
        done();
      }
    );
  });

  it("w przypadku napotkania błędu retry strategy powinien powtórzyć próbę subskrybcji określoną ilość razu", done => {
    let attempts = 2;
    let counter = -1;
    let sub: Observable<void> = Observable.create((observer: AnonymousSubject<void>) => {
      counter++;
      observer.error("Nowy błąd");
    });

    sub.pipe(retryWhen(retryStrategy({ maxRetryAttempts: attempts }))).subscribe(
      observer => {},
      err => {
        expect(counter).toBe(attempts);
        done();
      }
    );
  });

  it("przerwa pomiędzy powtórzeniami powinna być większa niż czas podany w konfiguracji", done => {
    const TIME_DURATION = 400;
    const ATTEMPTS = 3;
    let sub: Observable<void> = Observable.create((observer: AnonymousSubject<void>) => {
      observer.error("Nowy błąd");
    });
    let startTime = new Date().getTime();
    sub.pipe(retryWhen(retryStrategy({ scalingDuration: TIME_DURATION, maxRetryAttempts: ATTEMPTS }))).subscribe(
      observer => {},
      err => {
        let endTime = new Date().getTime();
        expect(endTime - startTime).toBeGreaterThan(TIME_DURATION * ATTEMPTS);
        done();
      }
    );
  });

  it("powinien w przypadku braku podania czasu pomiędzy powtórzeniami domyslnie ustawić 1000ms", done => {
    const TIME_DURATION = 1000;
    const ATTEMPTS = 2;
    let sub: Observable<void> = Observable.create((observer: AnonymousSubject<void>) => {
      observer.error("Nowy błąd");
    });
    let startTime = new Date().getTime();
    sub.pipe(retryWhen(retryStrategy({ maxRetryAttempts: ATTEMPTS }))).subscribe(
      observer => {},
      err => {
        let endTime = new Date().getTime();
        expect(endTime - startTime).toBeGreaterThan(TIME_DURATION * ATTEMPTS);
        done();
      }
    );
  });

  it("w przypadku napotkaniu błędu z statusem podanym w excludedStatusCodes powiniem od razu wyrzucić błąd i nie realizować określonej ilości prób", done => {
    const ATTEMPTS = 6;
    const TIME_DURATION = 50;
    let counter = -1;
    let sub: Observable<void> = Observable.create((observer: AnonymousSubject<void>) => {
      counter++;
      if (counter === 3) {
        let err = { message: "błąd", status: 400 };
        observer.error(err);
      } else {
        let err = { message: "błąd", status: 300 };
        observer.error(err);
      }
    });
    sub.pipe(retryWhen(retryStrategy({ scalingDuration: TIME_DURATION, maxRetryAttempts: ATTEMPTS, excludedStatusCodes: [400] }))).subscribe(
      observer => {},
      err => {
        expect(counter).toBe(3);
        expect(err.status).toBe(400);
        done();
      }
    );
  });
});
