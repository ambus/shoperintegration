import { ShoperStock } from "../../src/models/shoper-stock";
import { ShoperStockService } from "../../src/shoper/shoper-stock-service/shoper-stock-service";
import { of } from "rxjs";
import { AjaxResponse } from "rxjs/ajax";
import { ShoperUpdateService } from "../../src/shoper/shoper-update-service/shoper-update-service";

export let shoperUpdateStock: AjaxResponse = {
  originalEvent: null,
  xhr: null,
  request: null,
  status: null,
  response: 1,
  responseText: null,
  responseType: null
};
export let shoperUpdateStockError: AjaxResponse = {
  originalEvent: null,
  xhr: null,
  request: null,
  status: null,
  response: {
    error: "server_error",
    error_description: "Decoding failed: Syntax error"
  },
  responseText: null,
  responseType: null
};

export let mockup_pushAjaxShoperUpdate = function(shoperUpdateService: ShoperUpdateService) {
  return jest.spyOn(shoperUpdateService, "_pushAjaxShoperUpdate").mockReturnValue(of(shoperUpdateStock));
};
