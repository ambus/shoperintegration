import * as TokenGenerator from "./token-generator";
describe("tokenGenerator", () => {
  it("musi istnieć funkcja do generowania tokena", () => {
    expect(TokenGenerator.getToken).not.toBeUndefined();
  });
  it("funkcja powinna przyjmować dwa parametry - login i hasło", done => {
    spyOn(TokenGenerator, "getToken").and.callFake(function(login: string, password: string) {
      expect(login).toEqual(jasmine.any(String));
      expect(password).toEqual(jasmine.any(String));
      done();
    });
    TokenGenerator.getToken("szymon", "test");
  });
  it("powinna zwrócić tekst z tokenem", () => {
    expect(TokenGenerator.getToken("szymon", "test")).toEqual(jasmine.any(String));
    expect(TokenGenerator.getToken("szymon", "test")).toEqual("c3p5bW9uOnRlc3Q=");
  });
  it("w przypadku podania danych undefinded zwrócony string powinien mieć taką samą postać jak przy pustych stringach", () => {
    expect(TokenGenerator.getToken(undefined, undefined)).toEqual(jasmine.any(String));
    expect(TokenGenerator.getToken(undefined, undefined)).toEqual("Og==");
    expect(TokenGenerator.getToken(undefined, undefined)).toEqual(TokenGenerator.getToken("", ""));
  });
});
