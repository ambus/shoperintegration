import { SQLiteService } from "./sqlite.service";
describe('SQLite', () => {

    it('przy tworzeniu powinniśmy otrzymać tą samą instancję', () => {
        let instance1 = SQLiteService.getInstance();
        const KEY_NAME = "key";

        instance1[KEY_NAME] = "test1"
        expect(instance1["key"]).toEqual("test1")

        let instance2 = SQLiteService.getInstance();
        instance2['key'] = "test2"
        expect(instance1["key"]).toEqual("test2")
    });
});
