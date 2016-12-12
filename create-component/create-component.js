"use strict";

Object.defineProperty(exports, "__esModule", {
  value: !0
});

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
      console.log("DONE");
    });
    // have Yeoman greet the user
    console.log(this.yeoman);

    // replace it with a short and sweet description of your generator
    console.log(_chalk2["default"].magenta("You're using the Atomic generator."));
    this.fields = [];
    this.links = [];
    this.importsLinks = [];
  },
  askForComponentDetails: function () {
    var _ref = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee() {
      var done, prompts, detail;
      return _regenerator2["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              done = this.async();
              prompts = [{
                name: "componentName",
                message: "What would you like to call your component?",
                "default": "AtomicComponent"
              }, {
                name: "componentRepository",
                message: "What is the repository of this component (blank if same as project repo)?",
                "default": ""
              }];
              _context.next = 4;
              return this.prompting(prompts);

            case 4:
              detail = _context.sent;

              this.componentName = detail.componentName;
              this.componentRepository = detail.componentRepository;
              this.slugifiedComponentName = this._.slugify(this.componentName);
              this.humanizedComponentName = this._.humanize(this.componentName);
              this.snakeCasedComponentName = this._.underscored(this.componentName);
              this.classifiedComponentName = this._.classify(this.componentName);
              this.camelizedComponentName = this._.camelize(this.componentName);

              done();

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function askForComponentDetails() {
      return _ref.apply(this, arguments);
    }

    return askForComponentDetails;
  }(),
  checkSettings: function checkSettings() {
    try {
      this.atomic = require(_path2["default"].resolve("atomic.json"));
      this.component = {
        Name: this.componentName,
        Repository: this.componentRepository,
        AtomicDeps: []
      };
    } catch (e) {
      console.log("This is not atomic root project");
    }
  },
  renderComponentAtomicDependencies: function () {
    var _ref2 = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee2() {
      var done, prompts, deps, prompt, repo, dependencyInfo, d, _dependencyInfo;

      return _regenerator2["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              done = this.async();

              this.dependencies = [];
              this.imports = "";
              this.exports = "{\n";
              // if there is not repository (this is a local component)
              // if it has a repository.. it will then be stored in src/components

              prompts = [{
                type: "confirm",
                name: "addDependency",
                message: "You want to add atomic component dependency?",
                "default": "Y"
              }];
              _context2.next = 7;
              return this.prompting(prompts);

            case 7:
              deps = _context2.sent;

              if (!deps.addDependency) {
                _context2.next = 32;
                break;
              }

              prompt = [{
                name: "depRepository",
                message: "What is the repository of this component or relative path to src\/?",
                "default": ""
              }];
              _context2.next = 12;
              return this.prompting(prompt);

            case 12:
              repo = _context2.sent;

              if (!(repo.depRepository.split("https").length === 2 || repo.depRepository.split("git@").length === 2)) {
                _context2.next = 25;
                break;
              }

              _context2.next = 16;
              return _installComponent2["default"].bind(this)(repo.depRepository);

            case 16:
              dependencyInfo = _context2.sent;
              d = _lodash2["default"].cloneDeep(dependencyInfo);

              delete d.AtomicDeps;
              delete d.config;
              delete d.dependencies;
              this.component.AtomicDeps.push(d);
              this.renderComponentAtomicDependencies();
              _context2.next = 30;
              break;

            case 25:
              _dependencyInfo = _dependencyInfo = require(_path2["default"].resolve("./src/" + repo.depRepository + "/settings"));
              // installing local dependency to non-local component is not allowed
              // because...

              if (!(this.componentRepository !== "" && _dependencyInfo.Repository === "")) {
                _context2.next = 30;
                break;
              }

              console.log("if your component is not local only then you cannot add a relative component as dependency.");
              this.renderComponentAtomicDependencies();
              return _context2.abrupt("return");

            case 30:
              _context2.next = 34;
              break;

            case 32:
              this.exports += "}";
              done();

            case 34:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function renderComponentAtomicDependencies() {
      return _ref2.apply(this, arguments);
    }

    return renderComponentAtomicDependencies;
  }(),
  askForFields: function () {
    var _ref3 = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee3() {
      var done, confirmAddFields, confirm, prompts, field;
      return _regenerator2["default"].wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              done = this.async();
              confirmAddFields = [{
                name: "confirm",
                type: "confirm",
                message: "Add Table Field?",
                "default": !0
              }];
              _context3.next = 4;
              return this.prompting(confirmAddFields);

            case 4:
              confirm = _context3.sent;

              if (confirm.confirm) {
                _context3.next = 7;
                break;
              }

              return _context3.abrupt("return", done());

            case 7:
              prompts = [{
                name: "fieldName",
                message: "Enter field name:",
                "default": ""
              }, {
                name: "dataType",
                message: "Enter data type:",
                type: "list",
                choices: ["text", "numeric", "integer", "boolean", "date", "timestamp", "uuid"],
                "default": "text"
              }, {
                name: "notNull",
                message: "Not Null?:",
                type: "confirm",
                "default": !1
              }, {
                name: "defaultValue",
                message: "Enter default value:",
                "default": ""
              }, {
                name: "validator",
                type: "checkbox",
                message: "Select schema validation",
                choices: ["isRequired", "isUUID", "isLength(min, max)", "isBool", "isPhoneNumber", "isInteger", "isFloat", "isString", "isIn(values)", "isDate", "isArray(schema)", "isObject(schema)"]
              }, {
                name: "linkedTo",
                message: "Reference:",
                "default": ""
              }];
              _context3.next = 10;
              return this.prompting(prompts);

            case 10:
              field = _context3.sent;

              this.fields.push({
                name: field.fieldName,
                type: field.dataType,
                defaults: field.defaultValue,
                validator: field.validator,
                linkedTo: field.linkedTo,
                notNull: field.notNull
              });
              this.askForFields();

            case 13:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, this);
    }));

    function askForFields() {
      return _ref3.apply(this, arguments);
    }

    return askForFields;
  }(),
  askForLinks: function () {
    var _ref4 = (0, _asyncToGenerator3["default"])(_regenerator2["default"].mark(function _callee4() {
      var done, confirmAddFields, confirm, prompts, field;
      return _regenerator2["default"].wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              done = this.async();
              confirmAddFields = [{
                name: "confirm",
                type: "confirm",
                message: "Add Link?",
                "default": !0
              }];
              _context4.next = 4;
              return this.prompting(confirmAddFields);

            case 4:
              confirm = _context4.sent;

              if (confirm.confirm) {
                _context4.next = 7;
                break;
              }

              return _context4.abrupt("return", done());

            case 7:
              prompts = [{
                name: "fk",
                message: "Enter FK:",
                "default": ""
              }, {
                name: "alias",
                message: "Enter Alias:",
                "default": "text"
              }, {
                name: "object",
                message: "Enter object variable:",
                "default": ""
              }, {
                name: "path",
                message: "Enter object path:",
                "default": ""
              }];
              _context4.next = 10;
              return this.prompting(prompts);

            case 10:
              field = _context4.sent;

              this.links.push({
                fk: field.fk,
                alias: field.alias,
                name: this._.classify(field.object),
                path: field.path
              });
              if (_lodash2["default"].findIndex(this.importsLinks, { path: field.path }) === -1) {
                this.importsLinks.push({
                  name: this._.classify(field.object),
                  path: field.path
                });
              }
              this.askForLinks();

            case 14:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, this);
    }));

    function askForLinks() {
      return _ref4.apply(this, arguments);
    }

    return askForLinks;
  }(),
  copyApplicationFolder: function copyApplicationFolder() {
    var _this2 = this;

    this.atomic = require(_path2["default"].resolve("atomic.json"));
    _registerEverything2["default"].bind(this)(this.component);
    this.config = this.atomic.config;
    // install required NPM Package
    _npmInstall2["default"].bind(this)(this.atomic);
    this.component = _formatJson2["default"].plain(this.component);
    this.dependencies = _formatJson2["default"].plain(this.AtomicDeps);
    this.template("index.js", "src/" + this.classifiedComponentName + "/index.js");
    var schema = [];
    if (this.fields.length > 0) {
      this.fieldNames = _formatJson2["default"].plain(this.fields.map(function (field) {
        return field.name;
      }));
      this.validators = [];
      this.fields.map(function (field, index) {
        if (field.validator.length > 0) {
          field.validator.map(function (validator) {
            if (_lodash2["default"].indexOf(_this2.validators, validator) === -1) {
              _this2.validators.push(validator);
            }
          });
          schema.push({
            name: _this2._.camelize(field.name),
            validator: field.validator.join(", ")
          });
        }
        if (field.linkedTo) {
          // let obj = require(path.resolve(`./src/${field.linkedTo}`))
          // delete require.cache[path.resolve(`./src/${field.linkedTo}`)]
          _this2.fields[index].reference = field.linkedTo;
        }
      });
      this.schema = schema;
      // generate component variables
      this.template("model.js", "src/" + this.classifiedComponentName + "/" + this.classifiedComponentName + ".js");
      this.template("migration.js", "src/" + this.classifiedComponentName + "/db-migration.js");
      this.atomic.migrations.push({
        Name: this.classifiedComponentName
      });
    }
    // rewrite atomic.json
    this.mySettings = _formatJson2["default"].plain(this.atomic);
    _generateVariables2["default"].bind(this)(this.atomic);
    this.template("settings.js", "src/" + this.classifiedComponentName + "/settings.js");
    this.template("resource.js", "src/" + this.classifiedComponentName + ("/" + this.slugifiedComponentName + "-resource.js"));
    _shelljs2["default"].exec("rm -rf " + _path2["default"].resolve("atomic.json"));
    this.template("_atomic", _path2["default"].resolve("atomic.json"));
  }
});

exports["default"] = AtomicGenerator;
module.exports = exports["default"];