"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _shelljs = require("shelljs");

var _shelljs2 = _interopRequireDefault(_shelljs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function npmInstall(atomic) {
  var rootDir = this.isComponentDep ? "./../../" : "./";
  var packages = require(_path2["default"].resolve(rootDir + "package"));
  _lodash2["default"].each(atomic.dependencies, function (version, pack) {
    var installed = !!packages.dependencies[pack];
    if (!installed) {
      _shelljs2["default"].exec("npm install --save " + pack + (version !== "" ? "@" + version : ""));
      // set as true (meaning installed)
      atomic.dependencies[pack] = version;
    }
  });
}

exports["default"] = npmInstall;
module.exports = exports["default"];