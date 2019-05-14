import { AjaxResponse } from "rxjs/ajax";
import { stringGenerator } from "../../src/lib/string-generator";
import { ShoperGetToken } from "../../src/shoper/shoper-get-token";
import { of } from "rxjs";

export let mockupData_shoperGetToken: AjaxResponse = {
  originalEvent: null,
  xhr: null,
  request: null,
  status: null,
  response: {
    access_token: stringGenerator(),
    expires_in: 2592000,
    token_type: "bearer",
    typ: "Dane pobrane z mockup'u"
  },
  responseText: null,
  responseType: null
};

export let mockup_shoperGetToken = function() {
  return jest.spyOn(ShoperGetToken, "_getAjaxConnection").mockReturnValue(of(mockupData_shoperGetToken));
};
