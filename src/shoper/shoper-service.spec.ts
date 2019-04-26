import { Config } from "../config/config";
import { ShoperService } from "./shoper-service";

describe("shoperService", () => {
    it("można utworzyć obiekt shoperService", () => {
        expect(new ShoperService(Config.getInstance())).toBeDefined();
    })
})