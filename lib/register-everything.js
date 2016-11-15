"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function registerEverything(settings) {
  var _this = this;

  var componentFound = !1;
  _lodash2["default"].each(this.atomic.AtomicDeps, function (existingDeps) {
    if (existingDeps.Name === settings.Name) {
      componentFound = !0;
    }
  });
  if (!componentFound) {
    console.log("Registering " + settings.Name);
    var set = _lodash2["default"].cloneDeep(settings);
    delete set.AtomicDeps;
    delete set.config;
    delete set.dependencies;
    this.atomic.AtomicDeps.push(set);
  }
  this.atomic.config = this.atomic.config ? this.atomic.config : {};
  _lodash2["default"].defaultsDeep(this.atomic.config, settings.config);
  this.atomic.dependencies = this.atomic.dependencies ? this.atomic.dependencies : {};
  _lodash2["default"].each(settings.dependencies, function (version, npmPackage) {
    if (!_this.atomic.dependencies[npmPackage]) {
      // set as false.. meaning not installed
      _this.atomic.dependencies[npmPackage] = version;
    }
  });
}

exports["default"] = registerEverything;
module.exports = exports["default"];