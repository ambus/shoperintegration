import { of } from "rxjs";
import { FilonMerchandise } from "../models/filon-merchandise";
import { filonMerchandisesMockup } from "../../test/mockup/filon-merchandise.mockup";
import { replaceCommaInPrice } from "./replace-comma";

describe("replaceComma", () => {
  it("w obiekcie filonMerchandise w polu price powinien zamienić przecinki na kropki", () => {
    of(filonMerchandisesMockup)
      .pipe(replaceCommaInPrice())
      .subscribe((filonMerchandises: FilonMerchandise[]) => {
        expect(filonMerchandises[0].price).toBe("139.57");
      });
  });
});
