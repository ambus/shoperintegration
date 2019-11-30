import { SQLiteService } from "./sqlite.service";
import { stringGenerator } from "../lib/string-generator";

describe("SQLite - weryfikcja modelu singletone", () => {
  it("przy tworzeniu powinniśmy otrzymać tą samą instancję", () => {
    let instance1 = SQLiteService.getInstance();
    const KEY_NAME = "key";

    instance1[KEY_NAME] = "test1";
    expect(instance1["key"]).toEqual("test1");

    let instance2 = SQLiteService.getInstance();
    instance2[KEY_NAME] = "test2";
    expect(instance1["key"]).toEqual("test2");
  });
});

describe("SQLite", () => {
  const sqliteService: SQLiteService = SQLiteService.getInstance();

  it("powinna zostać utworzona baza danych oraz usunięta", () => {
    const randomName = "test" + Math.round(Math.random() * 1000);
    expect(sqliteService.createTable(`${randomName} (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL)`)).toBeTruthy();
    expect(sqliteService.dropTable(randomName)).toBeTruthy();
  });

  it("utworzenie drugiej takiej samej bazy powinno skończyć się niepowodzeniem", () => {
    const randomName = "test" + Math.round(Math.random() * 1000);
    expect(sqliteService.createTable(`${randomName} (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL)`)).toBeTruthy();
    expect(sqliteService.createTable(`${randomName} (id INTEGER PRIMARY KEY NOT NULL, name TEXT NOT NULL)`)).toBeFalsy();

    expect(sqliteService.dropTable(randomName)).toBeTruthy();
  });

  it("usunięcie bazy która nie istnieje powinno skończyć się niepowodzeniem", () => {
    const randomName = "test" + Math.round(Math.random() * 1000);
    expect(sqliteService.dropTable(randomName + 3)).toBeFalsy();
  });
});
