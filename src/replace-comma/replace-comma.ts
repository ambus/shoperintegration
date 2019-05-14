import { OperatorFunction, Observable, throwError } from "rxjs";
import { FilonMerchandise } from "../models/filon-merchandise";
import { map, catchError } from "rxjs/operators";

export function replaceCommaInPrice(): OperatorFunction<FilonMerchandise[], FilonMerchandise[]> {
  return (source: Observable<FilonMerchandise[]>) => {
    return source.pipe(
      map((filonMerchandises: FilonMerchandise[]) => {
        filonMerchandises.map((filonMerchandise: FilonMerchandise) => {
          filonMerchandise.price = filonMerchandise.price.replace(",", ".");
          if (filonMerchandise.priceE) {
            filonMerchandise.priceE = filonMerchandise.priceE.replace(",", ".");
          }
          return filonMerchandise;
        });
        return filonMerchandises;
      }),
      catchError((err: any, caught: Observable<FilonMerchandise[]>) => {
        this.logger.error(`Napotkano błąd podczas zmieniania przecinków na kropki w danych z filona`, err);
        throwError(err);
        return caught;
      })
    );
  };
}
