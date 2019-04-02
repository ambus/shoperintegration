// import * as index from "./index";
import { init } from "./index";

describe("Index init", () => {
  test("Czy index zawiera funkcję inicjującą ", done => {
    expect(init).toBeDefined();
    done()
  });
});

// describe("Index logger", () => {
//   test("Czy istnieje logger", done => {
//     expect(index.logger).toBeDefined();
//     done()
//   });
// });
