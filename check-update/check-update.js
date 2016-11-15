"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _yeomanGenerator = require("yeoman-generator");

var _yeomanGenerator2 = _interopRequireDefault(_yeomanGenerator);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _isThere = require("is-there");

var _isThere2 = _interopRequireDefault(_isThere);

var _child_process = require("child_process");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var AtomusGenerator = _yeomanGenerator2["default"].generators.Base.extend({
  init: function init() {
    // invoke npm install on finish
    this.on("end", function () {
      // if (!this.options["skip-install"]) {
      //   this.npmInstall()
      // }
    });
    // have Yeoman greet the user
    console.log(this.yeoman);

    // replace it with a short and sweet description of your generator
    console.log(_chalk2["default"].magenta("You\"re using the Atomic generator."));
  },
  check: function check() {
    var done = this.async();
    var currentComponentIndex = 0;
    function pullChanges(components, indexComponent) {
      var component = components[indexComponent];
      if (component !== void 0) {
        if ((0, _isThere2["default"])(_path2["default"].resolve("./src/" + component + "/.git"))) {
          console.log("Checking " + component);
          (0, _child_process.exec)("cd " + _path2["default"].resolve("./src/" + component) + " && git pull", function (error, stdout) {
            console.log(stdout);
            currentComponentIndex += 1;
            pullChanges(components, currentComponentIndex);
          });
        } else {
          currentComponentIndex += 1;
          pullChanges(components, currentComponentIndex);
        }
      } else {
        done();
      }
    }
    _fs2["default"].readdir(_path2["default"].resolve("./src"), function (err, components) {
      pullChanges(components, currentComponentIndex);
    });
  }
});

exports["default"] = AtomusGenerator;
module.exports = exports["default"];