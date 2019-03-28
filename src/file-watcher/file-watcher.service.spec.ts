import { FileWacherService } from "./file-watcher.service";

describe("FileWatcher", () => {
  test("Czy jest zdefiniowana klasa FileWatcher", done => {
    expect(FileWacherService).toBeDefined();
    done()
  });
});
