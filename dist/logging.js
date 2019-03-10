"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = log;
exports.resetLog = resetLog;

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function log(line) {
  _fs.default.appendFileSync('log.txt', "".concat(line, "\n"));

  console.log(line);
}

function resetLog() {
  return new Promise(function (resolve) {
    _fs.default.truncate('log.txt', 0, resolve);
  });
}