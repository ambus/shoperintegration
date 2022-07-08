import { getLogger } from "log4js";
import { FilonMerchandise } from "../models/filon-merchandise";
import parse = require("csv-parse/lib/sync");
import { ParserOptions } from "../models/parser-options";
import { OperatorFunction, Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";

export const logger = getLogger();

export function parseCSVDataToFilonMerchandise(dataToParse: string, config: ParserOptions): FilonMerchandise[] {
  let parsedMerchandiseArray: FilonMerchandise[] = [];
  logger.debug("Dane do parsowania: ", dataToParse);
  try {
    parsedMerchandiseArray = replaceCommaInFilonMerchandisesPrices(parse(dataToParse, config));

    if (!firstoObjectHavaAlleRequiredField(parsedMerchandiseArray)) {
      logger.error("Dane przekazane do parsowania niestety nie posiadają wymaganych pól! Zwrócono pustą tablicę.");
      return [];
    }
  } catch (err) {
    logger.error("Podczas parsowania danych napotkano błąd", err);
    return [];
  }
  parsedMerchandiseArray = changeCodeFromNumberToString(parsedMerchandiseArray);
  logger.debug(`Parsowanie zakończyło się powodzeniem. Odczytano ${parsedMerchandiseArray.length} towarów. Dane po parsowaniu:`, parsedMerchandiseArray);
  return parsedMerchandiseArray;
}

function firstoObjectHavaAlleRequiredField(merchandise: FilonMerchandise[]): boolean {
  return merchandise.length > 0 && typeof merchandise[0].product_code !== "undefined" && typeof merchandise[0].price !== "undefined" && typeof merchandise[0].stock !== "undefined";
}

function replaceCommaInFilonMerchandisesPrices(merchandise: FilonMerchandise[]): FilonMerchandise[] {
  merchandise.map((mer: FilonMerchandise) => {
    mer.price = mer.price.replace(",", ".");
  });
  logger.debug(`Dane po zamienie przecinków na kropki:`, merchandise);
  return merchandise;
}

export function parseCSVDataStream(parseOptions: ParserOptions): OperatorFunction<string, FilonMerchandise[]> {
  return (source: Observable<string>) => {
    return source.pipe(
      map((filonMerchandisesString: string) => {
        return parseCSVDataToFilonMerchandise(filonMerchandisesString, parseOptions);
      }),
      catchError((err: any, caught: Observable<FilonMerchandise[]>) => {
        this.logger.error(`Napotkano błąd podczas zmieniania przecinków na kropki w danych z filona`, err);
        throwError(err);
        return caught;
      })
    );
  };
}

function changeCodeFromNumberToString(merchandiseArray: FilonMerchandise[]): FilonMerchandise[] {
  const merchandises = [...merchandiseArray];
  for (const merchandise of merchandises) {
    merchandise.product_code = merchandise.product_code.toString();
  }
  return merchandises;
}
