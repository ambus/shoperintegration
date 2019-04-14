import { getLogger } from "log4js";
import { FilonMerchandise } from "../models/filon-merchandise";
import parse = require("csv-parse/lib/sync");
import { ParserOptions } from "../models/parser-options";

const PARSE_ERROR = "Napotkano błąd podczas parsowania otrzymanych danych! Prawdopodobnie jest błąd w strukturze stringa";

export function parseCSVDataToFilonMerchandise(dataToParse: string, config: ParserOptions): FilonMerchandise[] {
  let parsedMerchandiseArray: FilonMerchandise[] = [];
  logger.debug("Dane do parsowania: ", dataToParse);
  try {
    parsedMerchandiseArray = replaceCommaInFilonMerchandisesPrices(parse(dataToParse, config));

    if (firstoObjectHavaAlleRequiredField(parsedMerchandiseArray)) {
      logger.error("Dane przekazane do parsowania niestety nie posiadają wymaganych pól! Zwrócono pustą tablicę.");
      return [];
    }
  } catch (err) {
    logger.error("Podczas parsowania danych napotkano błąd", err);
    throw new Error(PARSE_ERROR);
  }
  logger.debug(`Parsowanie zakończyło się powodzeniem. Odczytano ${parsedMerchandiseArray.length} towarów. Dane po parsowaniu:`, parsedMerchandiseArray);
  return parsedMerchandiseArray;
}

function firstoObjectHavaAlleRequiredField(merchandise: FilonMerchandise[]): boolean {
  return merchandise.length > 0 && (typeof merchandise[0].product_code === "undefined" || typeof merchandise[0].price === "undefined" || typeof merchandise[0].stock === "undefined");
}

function replaceCommaInFilonMerchandisesPrices(merchandise: FilonMerchandise[]): FilonMerchandise[] {
  merchandise.map((merchandise: FilonMerchandise) => {
    merchandise.price = merchandise.price.replace(",", ".");
    merchandise.priceE = merchandise.priceE.replace(",", ".");
  });
  logger.debug(`Dane po zamienie przecinków na kropki:`, merchandise);
  return merchandise;
}
