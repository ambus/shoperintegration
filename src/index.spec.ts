import * as index from "./index";

describe("Index init", () => {
  test("Czy index zawiera funkcję inicjującą ", done => {
    expect(index.init).toBeDefined();
    done()
  });
});
