export function getToken(login: string = "", password: string = ""): string {
  return new Buffer(`${login}:${password}`).toString("base64");
}
