"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _yeomanGenerator = require("yeoman-generator");

var _yeomanGenerator2 = _interopRequireDefault(_yeomanGenerator);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _shelljs = require("shelljs");

var _shelljs2 = _interopRequireDefault(_shelljs);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _formatJson = require("format-json");

var _formatJson2 = _interopRequireDefault(_formatJson);

var _installComponent = require("../lib/install-component");

var _installComponent2 = _interopRequireDefault(_installComponent);

var _registerEverything = require("../lib/register-everything");

var _registerEverything2 = _interopRequireDefault(_registerEverything);

var _generateVariables = require("../lib/generate-variables");

var _generateVariables2 = _interopRequireDefault(_generateVariables);

var _npmInstall = require("../lib/npm-install");

var _npmInstall2 = _interopRequireDefault(_npmInstall);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var AtomicGenerator = _yeomanGenerator2["default"].generators.Base.extend({
  prompting: function prompting(prompt) {
    var _this = this;

    return new _promise2["default"](function (resolve) {
      try {
        _this.prompt(prompt, function (props) {
          resolve(props);
        });
      } catch (err) {}
    });
  },
  init: function init() {
    // invoke npm install on finish
    this.on("end", function () {
      // shell.exec("yo restify:install-component-deps")
      console.log("DONE");
    });
    // have Yeoman greet the user
    console.log(this.yeoman);

    // replace it with a short and sweet description of your generator
    console.log(_chalk2["default"].magenta("You\"re using the Atomic generator."));
  },
  askForComponentRepo: function () {
    var _ref = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee() {
      var _this2 = this;

      var done, prompts, repo, pathDest, getSettings, registerAll, _dependencyInfo, dependencyInfo;

      return _regenerator2["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              done = this.async();
              prompts = [{
                name: "repository",
                message: "git repository or relative path to \/src/",
                "default": ""
              }];

              // Ask the repository of the component to be installed

              _context.next = 4;
              return this.prompting(prompts);

            case 4:
              repo = _context.sent;
              pathDest = "../";

              this.repository = repo.repository;
              this.isComponentDep = !1;
              // we are installing a component as a dependency of another

              getSettings = function getSettings() {
                var settings = null;
                try {
                  settings = require(_path2["default"].resolve("./settings"));
                  _this2.isComponentDep = !0;
                  return settings;
                } catch (e2) {
                  return !1;
                }
              };

              this.atomicSetting = getSettings();

              registerAll = function registerAll(dependencyInfo) {
                _this2.atomic = _this2.isComponentDep ? require(_path2["default"].resolve("./../../atomic")) : require(_path2["default"].resolve("./atomic"));
                _registerEverything2["default"].bind(_this2)(dependencyInfo);

                _this2.config = _this2.atomic.config;
                // generate component variables
                _generateVariables2["default"].bind(_this2)();
                // install required NPM Package
                _npmInstall2["default"].bind(_this2)(_this2.atomic);
                // rewrite atomic.json
                _this2.mySettings = _formatJson2["default"].plain(_this2.atomic);
                _shelljs2["default"].exec("rm -rf " + _path2["default"].resolve("./../../atomic.json"));
                _this2.template("_atomic", _path2["default"].resolve("./../../atomic.json"));

                try {
                  var d = _lodash2["default"].cloneDeep(dependencyInfo);
                  delete d.AtomicDeps;
                  delete d.config;
                  delete d.dependencies;
                  // add the information of installed component to its parent component or to the project
                  // if the parent is just another component. do this
                  if (_this2.isComponentDep) {
                    _this2.atomicSetting.AtomicDeps.push(d);
                    // create the dependencies.js content
                    // so what we need to do is just read the previous settigns and add the new component to it
                    // then rewrite everything in settings.js and dependencies.js
                    _this2.atomicSetting = _formatJson2["default"].plain(_this2.atomicSetting);
                    // now rewrite the settings of the parent component
                    _this2.template("settings.js", _path2["default"].resolve("./settings.js"));
                  } else {
                    _this2.mySettings.AtomicDeps.push(d);
                    _this2.mySettings = _formatJson2["default"].plain(_this2.mySettings);
                    // now rewrite the settings of the parent component
                    _this2.template("_atomic", _path2["default"].resolve("./atomic.json"));
                  }
                } catch (e) {
                  console.log("something went wrong!" + e);
                }
                done();
              };

              pathDest = "../";
              // install the dependency component

              if (!(this.repository.split("https:\/\/").length === 2 || this.repository.split("git@").length === 2)) {
                _context.next = 19;
                break;
              }

              _context.next = 15;
              return _installComponent2["default"].bind(this)(this.repository);

            case 15:
              _dependencyInfo = _context.sent;

              registerAll(_dependencyInfo);
              _context.next = 21;
              break;

            case 19:
              dependencyInfo = require(_path2["default"].resolve(pathDest + this.repository + "/settings"));

              registerAll(dependencyInfo);

            case 21:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function askForComponentRepo() {
      return _ref.apply(this, arguments);
    }

    return askForComponentRepo;
  }()
});

module.exports = AtomicGenerator;