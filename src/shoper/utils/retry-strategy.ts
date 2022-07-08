import { Observable, timer, throwError } from "rxjs";
import { mergeMap, finalize } from "rxjs/operators";
import { Logger, getLogger } from "log4js";
const logger: Logger = getLogger("retryStrategy");

export const retryStrategy = ({
  maxRetryAttempts = 3,
  scalingDuration = 1000,
  excludedStatusCodes = []
}: {
  maxRetryAttempts?: number;
  scalingDuration?: number;
  excludedStatusCodes?: number[];
} = {}) => (attempts: Observable<any>) => {
  return attempts.pipe(
    mergeMap((error, i) => {
      const retryAttempt = i + 1;
      if (retryAttempt > maxRetryAttempts || excludedStatusCodes.find(e => e === error.status)) {
        return throwError(error);
      }
      logger.info(`Próba numer ${retryAttempt}: zwrócona po czasie ${retryAttempt * scalingDuration}ms`);
      return timer(scalingDuration);
    }),
    finalize(() => logger.warn("Przekroczono ilość prób ponowienia subskrybcji w przypadku błędu"))
  );
};
