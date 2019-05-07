export class ErrorObject<T, R> {
  data: T;
  message: R;
  statusCode: number;

  constructor(data: T, message: R, statusCode: number = 0) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
  }
}
