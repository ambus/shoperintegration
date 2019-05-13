import { Config } from "../../config/config";
import { ShoperStockService } from "./shoper-stock-service";
import { stringGenerator } from "../../lib/string-generator";
import { ShoperStock } from "../../models/shoper-stock";

describe("shoperGetToken", () => {
  it("musi zawierać konstruktor", () => {
    let shoperStockService = new ShoperStockService(Config.getInstance());
    expect(shoperStockService).toBeDefined();
  });

  it("funkcja _getAjaxConnection musi zwrócić obiekt AjaxRequest", () => {
    let shoperStockService = new ShoperStockService(Config.getInstance());
    expect(shoperStockService._getAjaxStock).toBeDefined();
  });

  it("funkcja getStock musi zwracać obiekt Observable", done => {
    let shoperStockService = new ShoperStockService(Config.getInstance());
    shoperStockService.getStock(stringGenerator(), stringGenerator()).subscribe((observer: ShoperStock) => {
      done();
    });
  });
});
