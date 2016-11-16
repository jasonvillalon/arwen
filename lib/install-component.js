"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _shelljs = require("shelljs");

var _shelljs2 = _interopRequireDefault(_shelljs);

var _isThere = require("is-there");

var _isThere2 = _interopRequireDefault(_isThere);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _registerEverything = require("./register-everything");

var _registerEverything2 = _interopRequireDefault(_registerEverything);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function exec(command) {
  console.log("Executing: " + command);
  try {
    return _shelljs2["default"].exec(command);
  } catch (err) {
    // console.log(err)
  }
}

function installComponent(repository) {
  var _this = this;

  var t = this;
  console.log("Install Component: " + repository);
  process.setMaxListeners(0);
  var tmpName = "tmp" + Math.random() * 100;
  var pathDest = this.isComponentDep ? "../" : "src/";
  this.atomic = this.atomic ? this.atomic : require(_path2["default"].resolve(this.isComponentDep ? "./../../atomic" : "./atomic"));
  if (!(0, _isThere2["default"])(pathDest)) {
    this.mkdir(pathDest);
  }
  function cloneComponent() {
    try {
      if (repository) {
        var rootDir = (t.isComponentDep ? _path2["default"].resolve("./../../") : _path2["default"].resolve("./")) + "/";
        exec("cd " + rootDir + "src/ && git clone " + repository + " " + tmpName);
        var settings = require(rootDir + "src/" + tmpName + "/settings");
        exec("cd " + rootDir + " && rm -rf src/" + tmpName);
        if ((0, _isThere2["default"])(rootDir + ".git/modules/src/" + settings.Name)) {
          exec("cd " + rootDir + " && git submodule deinit -f src/" + settings.Name + " && git rm src/" + settings.Name + " -f && rm -rf .git/modules/src/" + settings.Name);
        }
        if ((0, _isThere2["default"])(rootDir + "src/" + settings.Name)) {
          exec("cd " + rootDir + " && rm -rf src/" + settings.Name);
        }
        exec("cd " + rootDir + " && git submodule add -f " + repository + " src/" + settings.Name);
        return require(rootDir + "src/" + settings.Name + "/settings");
      }
    } catch (e) {
      console.log(e);
      return cloneComponent();
    }
  }
  var installAtomicDeps = function () {
    var _ref = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee(atomicDeps, index) {
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
              return installComponent.bind(_this)(obj.Repository);

            case 5:
              _context.next = 7;
              return installAtomicDeps.bind(_this)(atomicDeps, index + 1);

            case 7:
              return _context.abrupt("return", _context.sent);

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, _this);
    }));

    return function installAtomicDeps(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
  var checkIfComponentAlreadyInstalled = function checkIfComponentAlreadyInstalled() {
    var found = !1;
    _lodash2["default"].each(_this.atomic.AtomicDeps, function (deps) {
      if (deps.Repository === repository) {
        found = (0, _isThere2["default"])(_path2["default"].resolve("./" + pathDest + deps.Name));
        try {
          var depSettings = require(_path2["default"].resolve("./" + pathDest + deps.Name + "/settings"));
          found = depSettings;
        } catch (err) {
          // console.log(err)
          if (err.code === "MODULE_NOT_FOUND") {
            found = !1;
          }
        }
      }
    });
    return found;
  };
  return new _promise2["default"](function () {
    var _ref2 = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee2(resolve) {
      var settings, isNew;
      return _regenerator2["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              settings = checkIfComponentAlreadyInstalled();
              isNew = !1;

              if (!settings) {
                isNew = !0;
                settings = cloneComponent();
              }

              if (!(settings.AtomicDeps && settings.AtomicDeps.length > 0)) {
                _context2.next = 12;
                break;
              }

              _context2.next = 7;
              return installAtomicDeps.bind(t)(settings.AtomicDeps, 0);

            case 7:
              _registerEverything2["default"].bind(t)(settings);
              if (isNew && (0, _isThere2["default"])(_path2["default"].resolve("./" + pathDest + settings.Name + "/db-migration.js"))) {
                t.atomic.migrations = t.atomic.migrations || [];
                t.atomic.migrations.push({
                  Name: settings.Name
                });
              }
              resolve(settings);
              _context2.next = 15;
              break;

            case 12:
              _registerEverything2["default"].bind(t)(settings);
              if (isNew && (0, _isThere2["default"])(_path2["default"].resolve("./" + pathDest + settings.Name + "/db-migration.js"))) {
                t.atomic.migrations = t.atomic.migrations || [];
                t.atomic.migrations.push({
                  Name: settings.Name
                });
              }
              resolve(settings);

            case 15:
              _context2.next = 20;
              break;

            case 17:
              _context2.prev = 17;
              _context2.t0 = _context2["catch"](0);
              throw _context2.t0;

            case 20:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, _this, [[0, 17]]);
    }));

    return function (_x3) {
      return _ref2.apply(this, arguments);
    };
  }());
}

exports["default"] = installComponent;
module.exports = exports["default"];