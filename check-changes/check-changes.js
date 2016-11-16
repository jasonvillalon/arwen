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

var _shelljs = require("shelljs");

var _shelljs2 = _interopRequireDefault(_shelljs);

var _isThere = require("is-there");

var _isThere2 = _interopRequireDefault(_isThere);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var AtomicGenerator = _yeomanGenerator2["default"].generators.Base.extend({
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
    var t = this;
    var currentComponentIndex = 0;
    function askForCommentThenPush(components, component) {
      var prompts = [{
        name: "commitComment",
        message: "You are commiting changes from: " + component + " Component. Please add comment:",
        "default": "Fixing some bugs..."
      }];

      t.prompt(prompts, function (props) {
        _shelljs2["default"].exec("cd " + _path2["default"].resolve("./src/" + component) + " && git add --all");
        _shelljs2["default"].exec("cd " + _path2["default"].resolve("./src/" + component) + " && git commit -m \"" + props.commitComment + "\"");
        _shelljs2["default"].exec("cd " + _path2["default"].resolve("./src/" + component) + " && git push origin master");
        currentComponentIndex += 1;
        commitChanges(components, currentComponentIndex);
      });
    }
    function commitChanges(components, indexComponent) {
      var component = components[indexComponent];
      if (component !== void 0) {
        if ((0, _isThere2["default"])(_path2["default"].resolve("./src/" + component + "/.git"))) {
          console.log("Checking " + component);
          _shelljs2["default"].exec("cd " + _path2["default"].resolve("./src/" + component) + " && git diff");
          var status = _shelljs2["default"].exec("cd " + _path2["default"].resolve("./src/" + component) + " && git status");
          if (status.output.split("modified:").length >= 2 || status.output.split("Untracked files:").length >= 2 || status.output.split("deleted:").length >= 2) {
            askForCommentThenPush(components, component);
          } else {
            currentComponentIndex += 1;
            commitChanges(components, currentComponentIndex);
          }
        } else {
          currentComponentIndex += 1;
          commitChanges(components, currentComponentIndex);
        }
      } else {
        done();
      }
    }
    _fs2["default"].readdir(_path2["default"].resolve("./src"), function (err, components) {
      commitChanges(components, currentComponentIndex);
    });
  }
});

exports["default"] = AtomicGenerator;
module.exports = exports["default"];