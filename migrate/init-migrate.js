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

var _formatJson = require("format-json");

var _formatJson2 = _interopRequireDefault(_formatJson);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

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
  migrations: function migrations() {
    var _this = this;

    this.atomic = require(_path2["default"].resolve("./atomic"));
    _lodash2["default"].each(this.atomic.migrations, function (item, index) {
      if (!item.created && (0, _isThere2["default"])(_path2["default"].resolve("./src/" + item.Name + "/db-migration.js"))) {
        var output = _shelljs2["default"].exec("./script/db-migrate create " + _this._.slugify(item.Name));
        var migrationFile = output.output.replace("Created migration -- ", "").replace("\n", "");
        console.log(migrationFile);
        migrationFile = migrationFile.match(/(\/[^/ ]*)+\/?/g);
        console.log(migrationFile);
        console.log("COPY: " + _path2["default"].resolve("./src/" + item.Name + "/db-migration.js") + " to " + migrationFile[migrationFile.length - 1]);
        var cmd = "cp -f " + _path2["default"].resolve("./src/" + item.Name + "/db-migration.js") + " " + migrationFile[migrationFile.length - 1];
        // console.log(cmd)
        _shelljs2["default"].exec(cmd, { silent: !0 }, function () {
          // console.log(ress)
          console.log("Done Create Migrate File");
        });
        // console.log(result)
        _this.atomic.migrations[index].created = !0;
      }
    });
    this.mySettings = _formatJson2["default"].plain(this.atomic);
    _shelljs2["default"].exec("rm -rf " + _path2["default"].resolve("./atomic.json"));
    this.template("_atomic", _path2["default"].resolve("./atomic.json"));
  }
});

exports["default"] = AtomicGenerator;
module.exports = exports["default"];