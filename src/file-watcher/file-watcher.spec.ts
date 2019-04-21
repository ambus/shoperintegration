import { FileWatcher } from "./file-watcher";
import { Observable, Subject } from "rxjs";
import * as fs from "fs";
import { stringGenerator } from "../lib/string-generator";
import { Config } from "../config/config";
import { Index } from "../index";
import { AnonymousSubject } from "rxjs/internal/Subject";

const EXAMPLE_DATA = `product_code;stock;price
BUKWT2010;  41;110,0
BSZK0F1FLE051;   3;139,57
BSZK0F1FLE011;   3;139,57
BSZK0IZMWAS02;   2;16,00
ICAZG10KLD;  42;120,0`;

beforeAll(() => {
  Config.getInstance('configForTests.json');
});

describe("FileWatcher", () => {
  let fileWatcher: FileWatcher;
  beforeEach(() => {
    fileWatcher = new FileWatcher();
  });

  it("Czy jest zdefiniowana klasa FileWatcher", done => {
    expect(FileWatcher).toBeDefined();
    done();
  });

  it("powinan zostać zainicjowana konfiguracja", () => {
    expect(Config.getInstance()).toHaveProperty("encoding");
  });

  it("powinien zawierać instancję loggera", () => {
    expect(fileWatcher.logger).toBeDefined();
  });

  it("powinien zawierać funkcję uruchamiającą obserwowanie plików", () => {
    expect(fileWatcher.startWatch).toBeDefined();
  });

  it("powinna zwrócić przeczytane dane", async done => {
    new FileWatcher().readFile("./tmp/test3.csv").subscribe(
      (res: string) => {
        expect(res).toEqual(EXAMPLE_DATA);
        done();
      },
      (err: any) => expect(false).toBeTruthy()
    );
  });

  it("w przypadku błędu odczytu pliku funkcja readFile powinna zwrócić observable.error", async done => {
    new FileWatcher().readFile("test.error.csv").subscribe(
      (res: string) => expect(false).toBeTruthy(),
      (err: any) => {
        expect(err.name).toEqual("Error");
        expect(err.message).toEqual("ENOENT: no such file or directory, open 'test.error.csv'");
        done();
      }
    );
  });

  it("funkcja readFileAndSendThemToStream powinna odczytać plik i przekazać dane do podanego strumienia", done => {
    let fw = new FileWatcher();
    let stream = new Subject<string>();
    let fileName = `${stringGenerator()}.csv`;
    fs.writeFileSync(`./tmp/${fileName}`, EXAMPLE_DATA, { encoding: "utf8" });

    stream.subscribe((data: string) => {
      expect(data).toEqual(EXAMPLE_DATA);
      done();
    });

    fw.readFileAndSendThemToStream(`./tmp/${fileName}`, stream);
  });

  it("w przypadku błędu odczytu pliku funkcja readFileAndSendThemToStream powinna ponowić próbę 5 krotnie", done => {
    let fw = new FileWatcher();
    let stream = new Subject<string>();
    let counter = 0;
    spyOn(fw, "readFile").and.returnValue(
      Observable.create(
        function(observer: AnonymousSubject<any>) {
          observer.error(new Error("Błąd odczytu"));
          if (counter === 5) {
            done();
          }
          counter++;
        }.bind(this)
      )
    );
    fw.readFileAndSendThemToStream("test.csv", stream);
  });

  it("w przypadku błędu odczytu readFileAndSendThemToStream powinien zalogować błąd odczytu", done => {
    let fileName = `${stringGenerator()}.csv`;
    let fw = new FileWatcher();
    let stream = new Subject<string>();

    spyOn(fw.logger, "error").and.callFake(function(obj: any) {
      expect(obj).toContain(`Błąd podczas odczytu pliku tmp/${fileName}`);
      done();
    });

    spyOn(fw, "readFile").and.returnValue(
      Observable.create(
        function(observer: AnonymousSubject<any>) {
          observer.error(new Error("Błąd odczytu"));
        }.bind(this)
      )
    );
    fw.readFileAndSendThemToStream(`tmp/${fileName}`, stream);
  });

  it("utworzony plik powinien zostać usunięty", () => {
    let fw = new FileWatcher();
    let fileName = `${stringGenerator()}.csv`;
    fs.writeFileSync(`./tmp/${fileName}`, EXAMPLE_DATA, { encoding: "utf8" });
    expect(fs.existsSync(`./tmp/${fileName}`)).toBeTruthy();
    fw.deleteFile(`./tmp/${fileName}`);
    expect(fs.existsSync(`./tmp/${fileName}`)).toBeFalsy();
  });

  it("watchFile powinien zwrócić Subject w którym powinna przyjść informacja o pojawieniu się pliku", done => {
    let fileName = `${stringGenerator()}.csv`;

    new FileWatcher().watchFile(`tmp`).subscribe((path: string) => {
      if (path.toLowerCase() === `tmp/${fileName}`.toLowerCase()) {
        fs.unlinkSync(`tmp/${fileName}`);
        done();
      }
    });
    fs.writeFileSync(`tmp/${fileName}`, "", { encoding: "utf8" });
  });

  it("watchFile powinien zwrócić Subject w którym powinna przyjść informacja o zmianie w pliku", done => {
    let fileName = `${stringGenerator()}.csv`;
    fs.writeFileSync(`tmp/${fileName}`, "", { encoding: "utf8" });
    let counter = 0;

    new FileWatcher().watchFile(`tmp`).subscribe((path: string) => {
      if (counter >= 1) {
        if (path.toLowerCase() === `tmp/${fileName}`.toLowerCase()) {
          fs.unlinkSync(`tmp/${fileName}`);
          done();
        }
      }
      counter++;
    });
    setTimeout(() => {
      fs.writeFileSync(`tmp/${fileName}`, EXAMPLE_DATA, { encoding: "utf8" });
    }, 2000);
  });

  it("startWatch powinien zwracać strumień", () => {
    let fw = new FileWatcher();
    let fileName = `${stringGenerator()}.csv`;
    expect(fw.startWatch("tmp", fileName, false)).toBeDefined();
  });
  it("startWatch w przypadku napotkania błędu powinien zwrócić Observable.error i przerwać obserowanie plików", done => {
    let fileName = `${stringGenerator()}.csv`;
    let fw = new FileWatcher();
    spyOn(fw, "readFileAndSendThemToStream").and.callFake(function() {
      throw new Error("Błąd odczytu");
    });
    spyOn(fw.logger, "error").and.callFake(function(obj: any) {
      expect(obj).toContain(`Napotkano błąd podczas odczytu pliku ./tmp/${fileName}`);
    });
    fw.startWatch("./tmp/", fileName, true).subscribe(
      (data: string) => {
        expect(false).toBeTruthy();
      },
      (err: any) => {
        expect(err.name).toEqual("Error");
        expect(err.message).toEqual("Błąd odczytu");
        done();
      }
    );
  });

  it("w strumieniu powinny pojawić się dane wgrane do obserwowanego pliku podczas uruchamiania obserwowania", done => {
    let fw = new FileWatcher();
    let fileName = `${stringGenerator()}.csv`;
    if (fs.existsSync(`./tmp/${fileName}`)) {
      fs.unlinkSync(`./tmp/${fileName}`);
    }
    fs.writeFileSync(`./tmp/${fileName}`, EXAMPLE_DATA, { encoding: "utf8" });
    fw.startWatch("./tmp", fileName, true).subscribe((data: string) => {
      expect(data).toEqual(EXAMPLE_DATA);
      done();
    });
  });

  it("powinien usunąć plik z danymi po przeczytaniu ich", done => {
    let fw = new FileWatcher();
    let fileName = `${stringGenerator()}.csv`;

    if (fs.existsSync(`./tmp/${fileName}`)) {
      fs.unlinkSync(`./tmp/${fileName}`);
    }
    fs.writeFileSync(`./tmp/${fileName}`, EXAMPLE_DATA, { encoding: "utf8" });
    fw.startWatch("./tmp/", fileName, true).subscribe((data: string) => {
      expect(data).toEqual(EXAMPLE_DATA);
      expect(fs.existsSync(`./tmp/${fileName}`)).toBeFalsy();
      done();
    });
  });

  it("po zmianie danych w pliku powinny pojawić się one w strumieniu", done => {
    let fileName = `${stringGenerator()}.csv`;
    let fw = new FileWatcher();
    let counter = 0;

    fw.startWatch(`tmp`, fileName, true).subscribe((data: string) => {
      if (counter === 0) {
        expect(data).toEqual("");
        counter += 1;
        fs.writeFileSync(`tmp/${fileName}`, EXAMPLE_DATA, { encoding: "utf8" });
      } else {
        expect(data).toEqual(EXAMPLE_DATA);
        done();
      }
    });
    fs.writeFileSync(`tmp/${fileName}`, "", { encoding: "utf8" });
  });
});
