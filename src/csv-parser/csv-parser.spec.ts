import { parseCSVDataToFilonMerchandise, logger, parseCSVDataStream } from "./csv-parser";
import { Config } from "../config/config";
import { FilonMerchandise } from "../models/filon-merchandise";
import { of } from "rxjs";
import { filonStringMerchandise } from "../../test/mockup/filon-string.mockup";

const DATA_WITH_ERROR = `
product_code; srower,sdfasdkfj,asdfkj
askdjfh.;\sadfksjdhf
`;

const DATA_WITHOUT_HEAD = `
BSZK0F1FLE051;   2;139,57
BSZK0F1FLE011;   1;139,57
BSZK0IZMWAS02;   1;16,00
SBARDC22;6;824,10
`;

const OK_DATA = `
product_code;stock;price;priceE;warnLevel
BSZK0F1FLE051;   2;139,57;139,57;2
BSZK0F1FLE011;   1;139,57;122,00;3
BSZK0IZMWAS02;   1;16,00;139,57;4,6
SBARDC22;   6;824,10;139,57;-1
`;

const NUMBER_CODE_DATA = `
product_code;stock;price;priceE
BSZK0F1FLE051;   2;139,57;139,57
5903755049179;   2;122,00;122,00
BSZK0IZMWAS02;   1;16,00;139,57
SBARDC22;   6;824,10;139,57
`;

const TEST_CONFIG_FILE_PATH = "configForTests.json";

var config: Config;

beforeAll(function() {
  config = Config.getInstance(TEST_CONFIG_FILE_PATH);
  spyOn(logger, "debug").and.callFake(function(obj: any) {});
  spyOn(logger, "error").and.callFake(function(obj: any) {});
});

describe("CSVParser", () => {
  it("powinna istnieć funkcja parsująca", () => {
    expect(parseCSVDataToFilonMerchandise).toBeDefined();
  });

  it("w przypadku otrzymania pustego stringa funkcja parsująca powinna zwrócić pustą tablice", () => {
    expect(parseCSVDataToFilonMerchandise("", config.parserOptions)).toEqual([]);
    expect(parseCSVDataToFilonMerchandise("", config.parserOptions).length).toEqual(0);
  });

  it("w przypadku otrzymania nieprawidłowego obiektu csv funkcja parsująca powinna zwrócić pustą tablicę ", () => {
    expect(parseCSVDataToFilonMerchandise(DATA_WITH_ERROR, config.parserOptions)).toEqual([]);
    expect(parseCSVDataToFilonMerchandise(DATA_WITH_ERROR, config.parserOptions).length).toEqual(0);
  });

  it("w przypadku braku nagłówka funkcja powinna zwrócić pustą tablicę i zalogować błąd", () => {
    expect(parseCSVDataToFilonMerchandise(DATA_WITHOUT_HEAD, config.parserOptions).length).toEqual(0);
  });

  it("w przypadku otrzymania prawidłowych danych funkcja powinna zwrócić prawidłową tablicę danych", () => {
    let merchandises = parseCSVDataToFilonMerchandise(OK_DATA, config.parserOptions);
    expect(merchandises.length).toEqual(4);
    expect(merchandises[1].product_code).toEqual("BSZK0F1FLE011");
    expect(merchandises[3].price).toEqual("824.10");
    expect(merchandises[0].stock).toEqual(2);
    expect(merchandises[4]).toBeUndefined;
  });

  it("w cenach zamiast przecinka powinny pojawić się kropki", () => {
    let merchandises = parseCSVDataToFilonMerchandise(OK_DATA, config.parserOptions);
    merchandises.forEach((merchandise: FilonMerchandise) => {
      expect(Number(merchandise.price)).not.toBeNaN();
    });
  });

  it("jeśli korzystamy ze strumienia to po transformacji powinniśmy otrzymać obiekt FilonMerchandise[]", done => {
    of(filonStringMerchandise)
      .pipe(parseCSVDataStream(config.parserOptions))
      .subscribe((filonMerchandises: FilonMerchandise[]) => {
        expect(filonMerchandises.length).toBe(4);
        expect(filonMerchandises[0].product_code).toBe("BSZK0F1FLE051");
        done();
      });
  });

  it("Jeśli towar posiada kod składający się wyłącznie z liczb to powinien zostać on sparsowany na tekst", () => {
    let merchandises = parseCSVDataToFilonMerchandise(NUMBER_CODE_DATA, config.parserOptions);
    expect(merchandises.length).toBe(4)
    merchandises.forEach((merchandise: FilonMerchandise) => {
      expect(typeof merchandise.product_code === "string").toBeTruthy()
    });
  })
});
