import { ShoperStock } from "../../src/models/shoper-stock";
import { ShoperStockService } from "../../src/shoper/shoper-stock-service/shoper-stock-service";
import { of } from "rxjs";
import { AjaxResponse } from "rxjs/ajax";

export let shoperStockMockup: AjaxResponse = {
  originalEvent: null,
  xhr: null,
  request: null,
  status: null,
  response: {
    count: "1",
    pages: 1,
    page: 1,
    list: [
      {
        stock_id: "1145",
        extended: "0",
        price: "20.00",
        price_buying: "0.00",
        price_type: "1",
        stock: "11",
        package: "0",
        warn_level: "1",
        sold: "0",
        weight: "0",
        weight_type: "1",
        active: "1",
        default: "1",
        product_id: "502",
        availability_id: "9",
        delivery_id: "11",
        gfx_id: null,
        code: "PXSNGCN9933P#",
        ean: "",
        comp_weight: "0",
        comp_price: "20.00",
        comp_promo_price: "20.00",
        price_wholesale: "20.00",
        comp_price_wholesale: "20.00",
        comp_promo_price_wholesale: "20.00",
        price_special: "20.00",
        comp_price_special: "20.00",
        comp_promo_price_special: "20.00",
        price_type_wholesale: "0",
        price_type_special: "0",
        calculation_unit_id: null,
        calculation_unit_ratio: "0",
        options: []
      }
    ]
  },
  responseText: null,
  responseType: null
};
export let shoperStockWithExtendedMockup: AjaxResponse = {
  originalEvent: null,
  xhr: null,
  request: null,
  status: null,
  response: {
    count: "1",
    pages: 1,
    page: 1,
    list: [
      {
        stock_id: "311",
        extended: "1",
        price: "31.00",
        price_buying: "0.00",
        price_type: "3",
        stock: "15",
        package: "1",
        warn_level: "8",
        sold: "0",
        weight: "0",
        weight_type: "0",
        active: "1",
        default: "0",
        product_id: "270",
        availability_id: null,
        delivery_id: "1",
        gfx_id: "899",
        code: "ICAZG10KLE",
        ean: "",
        comp_weight: "1",
        comp_price: "89.00",
        comp_promo_price: "89.00",
        price_wholesale: "31.00",
        comp_price_wholesale: "89.00",
        comp_promo_price_wholesale: "89.00",
        price_special: "31.00",
        comp_price_special: "89.00",
        comp_promo_price_special: "89.00",
        price_type_wholesale: "0",
        price_type_special: "0",
        calculation_unit_id: null,
        calculation_unit_ratio: "0",
        options: {
          "40": "95"
        }
      }
    ]
  },
  responseText: null,
  responseType: null
};

export let mockup_getAjaxStock = function(shoperStockService: ShoperStockService) {
  return jest.spyOn(shoperStockService, "_getAjaxStocks").mockReturnValue(of(shoperStockMockup));
};
