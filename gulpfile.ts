import { src, series, dest } from "gulp";
import { execFile } from "child_process";
import { PORT, PROD_SERVER_ADRES, PROD_SERVER_PASS, PROD_REMOTE_PATH, DEV_SERVER_ADRES, DEV_SERVER_PASS, DEV_REMOTE_PATH } from "./gulpfile.conf";
var sftp = require("gulp-sftp-up4");
var del = require("del");

function release() {
  return del("./node_modules/.bin/standard-version");
}
function cleanDistDirectory() {
  return del("./dist/**/*");
}

function build() {
  return execFile("./node_modules/.bin/webpack");
}

function dev_uploadFileFTP(cb: any) {
  return src("./dist/main.bundle.*").pipe(
    sftp({
      host: DEV_SERVER_ADRES,
      user: DEV_SERVER_PASS.user,
      pass: DEV_SERVER_PASS.pass,
      remotePath: DEV_REMOTE_PATH + "/"
    })
  );
}

exports.dev_buildAndUpload = series(release, cleanDistDirectory, build, dev_uploadFileFTP);
