import { ErrorType } from "./error-type";

export class ErrorInTask {
  message: string;
  error: any;
  errorType: ErrorType;

  constructor(message: string, error: any, errorType: ErrorType = ErrorType.UNDEFINED) {
    this.message = message;
    this.error = error;
    this.errorType = errorType;
  }
}
