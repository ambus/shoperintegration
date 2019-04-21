export function getToken(login: string = "", password: string = ""): string {
  return Buffer.from(`${login}:${password}`).toString("base64");
}
