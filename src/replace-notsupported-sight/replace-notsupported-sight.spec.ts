import { of } from "rxjs";
import { FilonMerchandise } from "../models/filon-merchandise";
import { replaceNotSupportedSight } from "./replace-notsupported-sight";

let filonMerchandisesMockup: FilonMerchandise[] = [
  {
    product_code: "BSZK0F1FLE051#",
    stock: 2,
    price: "139,57",
    priceE: "15,00",
    warnLevel: 2
  }
];
describe("replaceComma", () => {
  it("w obiekcie filonMerchandise w polu price powinien zamienić przecinki na kropki", () => {
    of(filonMerchandisesMockup)
      .pipe(replaceNotSupportedSight())
      .subscribe((filonMerchandises: FilonMerchandise[]) => {
        expect(filonMerchandises[0].product_code).toBe("BSZK0F1FLE051\u0023");
      });
  });
});
