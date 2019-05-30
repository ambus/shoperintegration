import { OperatorFunction, Observable, throwError } from "rxjs";
import { FilonMerchandise } from "../models/filon-merchandise";
import { map, catchError } from "rxjs/operators";

export function replaceNotSupportedSight(): OperatorFunction<FilonMerchandise[], FilonMerchandise[]> {
  return (source: Observable<FilonMerchandise[]>) => {
    return source.pipe(
      map((filonMerchandises: FilonMerchandise[]) => {
        filonMerchandises.map((filonMerchandise: FilonMerchandise) => {
          filonMerchandise.product_code = filonMerchandise.product_code.replace("#", "\\u0023");
          return filonMerchandise;
        });
        return filonMerchandises;
      }),
      catchError((err: any, caught: Observable<FilonMerchandise[]>) => {
        this.logger.error(`Napotkano błąd podczas zmieniania nieobsługiwanych znaków w danych z filona`, err);
        throwError(err);
        return caught;
      })
    );
  };
}
