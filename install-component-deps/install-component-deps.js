"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _yeomanGenerator = require("yeoman-generator");

var _yeomanGenerator2 = _interopRequireDefault(_yeomanGenerator);

var _chalk = require("chalk");

var _chalk2 = _interopRequireDefault(_chalk);

var _shelljs = require("shelljs");

var _shelljs2 = _interopRequireDefault(_shelljs);

var _installComponent = require("../lib/install-component");

var _installComponent2 = _interopRequireDefault(_installComponent);

var _registerEverything = require("../lib/register-everything");

var _registerEverything2 = _interopRequireDefault(_registerEverything);

var _generateVariables = require("../lib/generate-variables");

var _generateVariables2 = _interopRequireDefault(_generateVariables);

var _npmInstall = require("../lib/npm-install");

var _npmInstall2 = _interopRequireDefault(_npmInstall);

var _formatJson = require("format-json");

var _formatJson2 = _interopRequireDefault(_formatJson);

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
  installer: function () {
    var _ref = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee2() {
      var _this = this;

      var done, getSettings, installEach, componentSettings;
      return _regenerator2["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              done = this.async();

              this.isComponentDep = !1;

              getSettings = function getSettings() {
                var settings = null;
                try {
                  _this.atomic = require(_path2["default"].resolve("../../atomic"));
                  settings = require(_path2["default"].resolve("./settings"));
                  _this.isComponentDep = !0;
                  return settings;
                } catch (e2) {
                  _this.atomic = require(_path2["default"].resolve("./atomic"));
                  return _this.atomic;
                }
              };

              installEach = function () {
                var _ref2 = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee(atomicDeps, index) {
                  var obj;
                  return _regenerator2["default"].wrap(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          if (atomicDeps[index]) {
                            _context.next = 2;
                            break;
                          }

                          return _context.abrupt("return");

                        case 2:
                          obj = atomicDeps[index];
                          _context.next = 5;
                          return _installComponent2["default"].bind(_this)(obj.Repository);

                        case 5:
                          _context.next = 7;
                          return installEach(atomicDeps, index + 1);

                        case 7:
                          return _context.abrupt("return", _context.sent);

                        case 8:
                        case "end":
                          return _context.stop();
                      }
                    }
                  }, _callee, _this);
                }));

                return function installEach(_x, _x2) {
                  return _ref2.apply(this, arguments);
                };
              }();

              componentSettings = getSettings();

              if (componentSettings) {
                _context2.next = 10;
                break;
              }

              console.log("This is not a valid project to install a component!");
              done();
              _context2.next = 24;
              break;

            case 10:
              _context2.prev = 10;
              _context2.next = 13;
              return installEach(componentSettings.AtomicDeps, 0);

            case 13:
              // register the current component now!
              if (this.isComponentDep) {
                this.atomic = require(_path2["default"].resolve("./../../atomic"));
                _registerEverything2["default"].bind(this)(componentSettings);
              }
              // generate component variables
              _generateVariables2["default"].bind(this)(this.atomic, this.isComponentDep);
              // install required NPM Package
              _npmInstall2["default"].bind(this)(this.atomic);
              // rewrite atomic.json
              this.mySettings = _formatJson2["default"].plain(this.atomic);
              if (this.isComponentDep) {
                this.atomicSetting = _formatJson2["default"].plain(componentSettings);
                // now rewrite the settings of the parent component
                this.template("settings.js", _path2["default"].resolve("./settings.js"));
                _shelljs2["default"].exec("rm -rf " + _path2["default"].resolve("./../../atomic.json"));
                this.template("_atomic", _path2["default"].resolve("./../../atomic.json"));
              } else {
                _shelljs2["default"].exec("rm -rf " + _path2["default"].resolve("./atomic.json"));
                this.template("_atomic", _path2["default"].resolve("./atomic.json"));
              }
              _context2.next = 23;
              break;

            case 20:
              _context2.prev = 20;
              _context2.t0 = _context2["catch"](10);

              console.log("something went wrong!" + _context2.t0);

            case 23:
              done();

            case 24:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this, [[10, 20]]);
    }));

    function installer() {
      return _ref.apply(this, arguments);
    }

    return installer;
  }()
});

exports["default"] = AtomicGenerator;
module.exports = exports["default"];