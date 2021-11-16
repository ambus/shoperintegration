import { FileWatcher } from "./file-watcher";
import { Observable, Subject } from "rxjs";
import * as fs from "fs";
import { stringGenerator } from "../lib/string-generator";
import { Config } from "../config/config";
import { AnonymousSubject } from "rxjs/internal/Subject";
import { filter, skip, take } from "rxjs/operators";

const TEST_CONFIG_FILE_PATH = "configForTests.json";

const EXAMPLE_DATA = `product_code;stock;price
BUKWT2010;  41;110,0
BSZK0F1FLE051;   3;139,57
BSZK0F1FLE011;   3;139,57
BSZK0IZMWAS02;   2;16,00
ICAZG10KLD;  42;120,0`;

beforeAll(() => {
  Config.getInstance("configForTests.json");
});

describe("FileWatcher", () => {
  let fileWatcher: FileWatcher;
  const config = Config.getInstance(TEST_CONFIG_FILE_PATH);
  const filePath = "tmp";
  let fileName: string;
  let filePathAndName: string;
  const fsConfig = { encoding: "utf8" };

  beforeEach(() => {
    fileWatcher = new FileWatcher(config);
    fileName = `${stringGenerator()}.csv`;
    filePathAndName = `${filePath}/${fileName}`;
    const randomString = stringGenerator();

    if (fs.existsSync(filePathAndName)) {
      fs.unlinkSync(filePathAndName);
    }
    fs.writeFileSync(filePathAndName, randomString, fsConfig);
  });

  afterEach(() => {
    if (fs.existsSync(filePathAndName)) {
      fs.unlinkSync(filePathAndName);
    }
  });

  it("Czy jest zdefiniowana klasa FileWatcher", (done) => {
    expect(FileWatcher).toBeDefined();
    done();
  });

  it("powinan zostać zainicjowana konfiguracja", () => {
    expect(Config.getInstance()).toBeDefined();
  });

  it("powinien zawierać instancję loggera", () => {
    expect(fileWatcher.logger).toBeDefined();
  });

  it("powinien zawierać funkcję uruchamiającą obserwowanie plików", () => {
    expect(fileWatcher.startWatch).toBeDefined();
  });

  it("powinna zwrócić przeczytane dane", async (done) => {
    const randomString = stringGenerator();
    fs.writeFileSync(filePathAndName, randomString, fsConfig);

    fileWatcher.readFile(filePathAndName).subscribe(
      (res: string) => {
        expect(res).toEqual(randomString);
        done();
      },
      (_err) => {
        throw new Error("Invalid value.");
      }
    );
  });

  it("w przypadku gdy plik nie istnieje, funkcja readFile powinna wpuscić do strumienia puste dane", async (done) => {
    new FileWatcher(config)
      .readFile(stringGenerator())
      .pipe(take(1))
      .subscribe(
        (value) => {
          expect(value).toBe("");
          done();
        },
        (_err) => {
          throw new Error("Invalid value.");
        }
      );
  });

  it("funkcja readFileAndSendThemToStream powinna odczytać plik i przekazać dane do podanego strumienia", (done) => {
    const stream = new Subject<string>();
    const randomData = stringGenerator();
    fs.writeFileSync(filePathAndName, randomData, fsConfig);

    stream.pipe(take(1)).subscribe((data: string) => {
      expect(data).toEqual(randomData);
      done();
    });

    fileWatcher.readFileAndSendThemToStream(filePathAndName, stream);
  });

  it("w przypadku błędu odczytu pliku funkcja readFileAndSendThemToStream powinna ponowić próbę odczytu", (done) => {
    const stream = new Subject<string>();
    let counter = 0;

    spyOn(fileWatcher, "readFile").and.returnValue(
      Observable.create(
        function (observer: AnonymousSubject<unknown>) {
          observer.error(new Error("Błąd odczytu"));
          if (counter >= 5) {
            done();
          }
          counter++;
        }.bind(this)
      )
    );
    fileWatcher.maxFileReadRetryAttempts = 5;
    fileWatcher.fileReadScalingDuration = 1;
    fileWatcher.readFileAndSendThemToStream(stringGenerator(), stream);
  });

  it("mail z informacjo o błędzie odczytu powinien zostać wysłany jedynie gdy błąd nie jest spowodowany zablokowanym dostępem do zasobu", (done) => {
    const stream = new Subject<string>();
    const spy = spyOn(fileWatcher.eMail, "sendMail").and.returnValue(undefined);

    spyOn(fileWatcher, "readFile").and.returnValue(
      Observable.create(
        function (observer: AnonymousSubject<unknown>) {
          observer.error("...resource busy or locked...");
        }.bind(this)
      )
    );

    fileWatcher.maxFileReadRetryAttempts = 1;
    fileWatcher.fileReadScalingDuration = 1;
    stream.pipe(take(1)).subscribe((_) => {
      expect(spy).not.toBeCalled();
      done();
    });

    fileWatcher.readFileAndSendThemToStream(stringGenerator(), stream);
  });

  it("w przypadku błędu odczytu readFileAndSendThemToStream powinien zalogować błąd odczytu", (done) => {
    const stream = new Subject<string>();

    spyOn(fileWatcher.logger, "error").and.callFake(function (obj: unknown) {
      expect(obj).toContain(`Błąd podczas odczytu pliku ${filePathAndName}`);
      done();
    });

    spyOn(fileWatcher, "readFile").and.returnValue(
      Observable.create(
        function (observer: AnonymousSubject<unknown>) {
          observer.error(new Error("Błąd odczytu"));
        }.bind(this)
      )
    );
    fileWatcher.maxFileReadRetryAttempts = 2;
    fileWatcher.fileReadScalingDuration = 1;
    fileWatcher.readFileAndSendThemToStream(filePathAndName, stream);
  });

  it("utworzony plik powinien zostać usunięty", () => {
    fs.writeFileSync(filePathAndName, stringGenerator(), fsConfig);
    expect(fs.existsSync(filePathAndName)).toBeTruthy();
    fileWatcher.deleteFile(filePathAndName);
    expect(fs.existsSync(filePathAndName)).toBeFalsy();
  });

  it("watchFile powinien zwrócić Subject w którym powinna przyjść informacja o pojawieniu się pliku", (done) => {
    const filePath = "tmp";
    const filePathAndName = `${filePath}/${stringGenerator()}.csv`;

    fileWatcher
      .watchFile(filePath)
      .pipe(filter((path) => path.toLowerCase() === filePathAndName.toLowerCase()))
      .pipe(take(1))
      .subscribe((_path: string) => {
        fs.unlinkSync(filePathAndName);
        done();
      });
    fs.writeFileSync(filePathAndName, "", { encoding: "utf8" });
  });

  it("watchFile powinien zwrócić Subject w którym powinna przyjść informacja o zmianie w pliku", (done) => {
    const exampleData = stringGenerator();

    fileWatcher
      .watchFile(filePath)
      .pipe(
        filter((path) => path.toLowerCase() === filePathAndName.toLowerCase()),
        skip(1)
      )
      .pipe(take(1))
      .subscribe((_path: string) => {
        expect(fs.readFileSync(filePathAndName, fsConfig)).toBe(exampleData);
        done();
      });

    setTimeout(() => {
      fs.writeFileSync(filePathAndName, exampleData, fsConfig);
    }, 500);
  });

  it("startWatch powinien zwracać strumień", () => {
    expect(fileWatcher.startWatch(filePath, fileName, false)).toBeInstanceOf(Observable);
  });

  it("startWatch w przypadku napotkania błędu powinien zwrócić Observable.error i przerwać obserowanie plików", (done) => {
    spyOn(fileWatcher, "readFileAndSendThemToStream").and.callFake(function () {
      throw new Error("Błąd odczytu");
    });
    spyOn(fileWatcher.logger, "error").and.callFake(function (obj: any) {
      expect(obj).toContain(`Napotkano błąd podczas odczytu pliku ${filePathAndName}`);
      done();
    });

    fileWatcher
      .startWatch(filePath, fileName, true)
      .pipe(take(1))
      .subscribe(
        (_data: string) => {
          expect(false).toBeTruthy();
        },
        (err: any) => {
          expect(err.name).toEqual("Error");
          expect(err.message).toEqual("Błąd odczytu");
        }
      );
  });

  it("w strumieniu powinny pojawić się dane wgrane do obserwowanego pliku podczas startu obserwowania", (done) => {
    const exampleData = stringGenerator();

    if (fs.existsSync(filePathAndName)) {
      fs.unlinkSync(filePathAndName);
    }
    fs.writeFileSync(filePathAndName, exampleData, { encoding: "utf8" });
    fileWatcher
      .startWatch(filePath, fileName, true)
      .pipe(take(1))
      .subscribe((data: string) => {
        expect(data).toEqual(exampleData);
        done();
      });
  });

  it("plik z danymi po odczytaniu powinien zostać usunięty", (done) => {
    const exampleData = stringGenerator();

    if (fs.existsSync(filePathAndName)) {
      fs.unlinkSync(filePathAndName);
    }
    fs.writeFileSync(filePathAndName, exampleData, { encoding: "utf8" });
    fileWatcher
      .startWatch(filePath, fileName, true)
      .pipe(take(1))
      .subscribe((data: string) => {
        expect(data).toEqual(exampleData);
        expect(fs.existsSync(filePathAndName)).toBeFalsy();
        done();
      });
  });

  it("po zmianie danych w pliku powinny pojawić się one w strumieniu", (done) => {
    const exampleData = stringGenerator();

    let counter = 0;

    fileWatcher
      .startWatch(filePath, fileName, true)
      .pipe(take(2))
      .subscribe((data: string) => {
        if (counter === 0) {
          expect(data).toEqual(exampleData);
          counter += 1;
          fs.writeFileSync(filePathAndName, EXAMPLE_DATA, { encoding: "utf8" });
        } else {
          expect(data).toEqual(EXAMPLE_DATA);
          done();
        }
      });
    fs.writeFileSync(filePathAndName, exampleData, { encoding: "utf8" });
  });
});
