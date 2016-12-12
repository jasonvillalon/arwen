"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _formatJson = require("format-json");

var _formatJson2 = _interopRequireDefault(_formatJson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// import shell from "shelljs"
function generateVariables() {
  this.config = _formatJson2["default"].plain(this.atomic.config);
  var rootDir = this.isComponentDep ? "./../../" : "./";
  // shell.exec("rm -rf " + path.resolve(rootDir + "config/default.js"))
  this.template("default.js", _path2["default"].resolve(rootDir + "config/default.js"));
}

exports["default"] = generateVariables;
module.exports = exports["default"];