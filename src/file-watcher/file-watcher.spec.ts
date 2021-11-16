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
  beforeEach(() => {
    fileWatcher = new FileWatcher(config);
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
    new FileWatcher(config).readFile("./tmp/test3.csv").subscribe(
      (res: string) => {
        expect(res).toEqual(EXAMPLE_DATA);
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
    const fw = new FileWatcher(config);
    const stream = new Subject<string>();
    const fileName = `${stringGenerator()}.csv`;
    fs.writeFileSync(`./tmp/${fileName}`, EXAMPLE_DATA, { encoding: "utf8" });

    stream.pipe(take(1)).subscribe((data: string) => {
      expect(data).toEqual(EXAMPLE_DATA);
      done();
    });

    fw.readFileAndSendThemToStream(`./tmp/${fileName}`, stream);
  });

  it("w przypadku błędu odczytu pliku funkcja readFileAndSendThemToStream powinna ponowić próbę odczytu", (done) => {
    const fw = new FileWatcher(config);
    const stream = new Subject<string>();
    let counter = 0;

    spyOn(fw, "readFile").and.returnValue(
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
    fw.maxFileReadRetryAttempts = 5;
    fw.fileReadScalingDuration = 1;
    fw.readFileAndSendThemToStream("test.csv", stream);
  });

  it("mail z informacjo o błędzie odczytu powinien zostać wysłany jedynie gdy błąd nie jest spowodowany zablokowanym dostępem do zasobu", (done) => {
    const fw = new FileWatcher(config);
    const stream = new Subject<string>();
    const spy = spyOn(fw.eMail, "sendMail").and.returnValue(undefined);

    spyOn(fw, "readFile").and.returnValue(
      Observable.create(
        function (observer: AnonymousSubject<unknown>) {
          observer.error("...resource busy or locked...");
        }.bind(this)
      )
    );

    fw.maxFileReadRetryAttempts = 1;
    fw.fileReadScalingDuration = 1;
    stream.pipe(take(1)).subscribe((_) => {
      expect(spy).not.toBeCalled();
      done();
    });

    fw.readFileAndSendThemToStream(stringGenerator(), stream);
  });

  it("w przypadku błędu odczytu readFileAndSendThemToStream powinien zalogować błąd odczytu", (done) => {
    const fileName = `${stringGenerator()}.csv`;
    const fw = new FileWatcher(config);
    const stream = new Subject<string>();

    spyOn(fw.logger, "error").and.callFake(function (obj: unknown) {
      expect(obj).toContain(`Błąd podczas odczytu pliku tmp/${fileName}`);
      done();
    });

    spyOn(fw, "readFile").and.returnValue(
      Observable.create(
        function (observer: AnonymousSubject<unknown>) {
          observer.error(new Error("Błąd odczytu"));
        }.bind(this)
      )
    );
    fw.maxFileReadRetryAttempts = 2;
    fw.fileReadScalingDuration = 1;
    fw.readFileAndSendThemToStream(`tmp/${fileName}`, stream);
  });

  it("utworzony plik powinien zostać usunięty", () => {
    const fw = new FileWatcher(config);
    const fileName = `./tmp/${stringGenerator()}.csv`;

    fs.writeFileSync(fileName, EXAMPLE_DATA, { encoding: "utf8" });
    expect(fs.existsSync(fileName)).toBeTruthy();
    fw.deleteFile(fileName);
    expect(fs.existsSync(fileName)).toBeFalsy();
  });

  it("watchFile powinien zwrócić Subject w którym powinna przyjść informacja o pojawieniu się pliku", (done) => {
    const filePath = "tmp";
    const filePathAndName = `${filePath}/${stringGenerator()}.csv`;

    new FileWatcher(config)
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
    const filePath = "tmp";
    const filePathAndName = `${filePath}/${stringGenerator()}.csv`;

    fs.writeFileSync(filePathAndName, "", { encoding: "utf8" });

    new FileWatcher(config)
      .watchFile(filePath)
      .pipe(filter((path) => path.toLowerCase() === filePathAndName.toLowerCase()))
      .pipe(take(1))
      .subscribe((_path: string) => {
        fs.unlinkSync(filePathAndName);
        done();
      });

    setTimeout(() => {
      fs.writeFileSync(filePathAndName, EXAMPLE_DATA, { encoding: "utf8" });
    }, 500);
  });

  it("startWatch powinien zwracać strumień", () => {
    const fw = new FileWatcher(config);
    const fileName = `${stringGenerator()}.csv`;
    expect(fw.startWatch("tmp", fileName, false)).toBeInstanceOf(Observable);
  });
  it("startWatch w przypadku napotkania błędu powinien zwrócić Observable.error i przerwać obserowanie plików", (done) => {
    const fileName = `${stringGenerator()}.csv`;
    const fw = new FileWatcher(config);

    spyOn(fw, "readFileAndSendThemToStream").and.callFake(function () {
      throw new Error("Błąd odczytu");
    });
    spyOn(fw.logger, "error").and.callFake(function (obj: any) {
      expect(obj).toContain(`Napotkano błąd podczas odczytu pliku ./tmp/${fileName}`);
    });

    fw.startWatch("./tmp/", fileName, true)
      .pipe(take(1))
      .subscribe(
        (_data: string) => {
          expect(false).toBeTruthy();
        },
        (err: any) => {
          expect(err.name).toEqual("Error");
          expect(err.message).toEqual("Błąd odczytu");
          done();
        }
      );
  });

  it("w strumieniu powinny pojawić się dane wgrane do obserwowanego pliku podczas startu obserwowania", (done) => {
    const fw = new FileWatcher(config);
    const filePath = "./tmp";
    const fileName = `${stringGenerator()}.csv`;
    const filePathAndName = `${filePath}/${fileName}`;

    if (fs.existsSync(filePathAndName)) {
      fs.unlinkSync(filePathAndName);
    }
    fs.writeFileSync(filePathAndName, EXAMPLE_DATA, { encoding: "utf8" });
    fw.startWatch(filePath, fileName, true)
      .pipe(take(1))
      .subscribe((data: string) => {
        expect(data).toEqual(EXAMPLE_DATA);
        done();
      });
  });

  it("plik z danymi po odczytaniu powinien zostać usunięty", (done) => {
    const fw = new FileWatcher(config);
    const filePath = "./tmp";
    const fileName = `${stringGenerator()}.csv`;
    const filePathAndName = `${filePath}/${fileName}`;

    if (fs.existsSync(filePathAndName)) {
      fs.unlinkSync(filePathAndName);
    }
    fs.writeFileSync(filePathAndName, EXAMPLE_DATA, { encoding: "utf8" });
    fw.startWatch(filePath, fileName, true)
      .pipe(take(1))
      .subscribe((data: string) => {
        expect(data).toEqual(EXAMPLE_DATA);
        expect(fs.existsSync(filePathAndName)).toBeFalsy();
        done();
      });
  });

  it("po zmianie danych w pliku powinny pojawić się one w strumieniu", (done) => {
    const fw = new FileWatcher(config);
    const filePath = "tmp";
    const fileName = `${stringGenerator()}.csv`;
    const filePathAndName = `${filePath}/${fileName}`;

    const randomString = stringGenerator();

    let counter = 0;

    fw.startWatch(filePath, fileName, true)
      .pipe(take(2))
      .subscribe((data: string) => {
        if (counter === 0) {
          expect(data).toEqual(randomString);
          counter += 1;
          fs.writeFileSync(filePathAndName, EXAMPLE_DATA, { encoding: "utf8" });
        } else {
          expect(data).toEqual(EXAMPLE_DATA);
          done();
        }
      });
    fs.writeFileSync(filePathAndName, randomString, { encoding: "utf8" });
  });
});
