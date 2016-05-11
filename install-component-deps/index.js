"use strict";
var
  path = require("path"),
  yeoman = require("yeoman-generator"),
  chalk = require("chalk"),
  shell = require("shelljs"),
  installComponent = require("../lib/installComponent"),
  registerEverything = require("../lib/registerEverything"),
  generateVariables = require("../lib/generateVariables"),
  npmInstall = require("../lib/npmInstall"),
  json = require("format-json"),
  _ = require("lodash"),
  IsThere = require("is-there");

var AtomicGenerator = yeoman.generators.Base.extend({
  init: function() {
    // invoke npm install on finish
    this.on("end", function() {
      // if (!this.options["skip-install"]) {
      //   this.npmInstall();
      // }
    });
    // have Yeoman greet the user
    console.log(this.yeoman);

    // replace it with a short and sweet description of your generator
    console.log(chalk.magenta("You\"re using the Atomic generator."));
  },
  installer: function() {
    var done = this.async();
    this.isComponentDep = false;
    var t = this;
    var getSettings = function() {
      var settings = null;
      try {
        this.atomic = require(path.resolve("../../atomic"));
        settings = require(path.resolve("./settings"));
        this.isComponentDep = true;
        return settings;
      } catch (e2) {
        this.atomic = require(path.resolve("./atomic"));
        return this.atomic;
      }
    }.bind(this);
    function installEach(atomicDeps, index, cb) {
      if (!atomicDeps[index]) {
        return cb();
      }
      var obj = atomicDeps[index];
      installComponent.bind(t)(obj.Repository).then(function() {
        installEach.bind(this)(atomicDeps, index + 1, cb);
      });
    }
    var componentSettings = getSettings();
    if (!componentSettings) {
      console.log("This is not a valid project to install a component!");
      done();
    } else {
      try {
        installEach.bind(this)(componentSettings.AtomicDeps, 0, function() {
          // register the current component now!
          if (this.isComponentDep) {
            this.atomic = require(path.resolve("./../../atomic"));
            registerEverything.bind(this)(componentSettings);
          }
          // generate component variables
          generateVariables.bind(t)(this.atomic, this.isComponentDep);
          // install required NPM Package
          npmInstall.bind(t)(t.atomic);
          // rewrite atomic.json
          t.mySettings = json.plain(t.atomic);
          if (this.isComponentDep) {
            var imports = "";
            var exports = "{";
            _.each(componentSettings.AtomicDeps, function(deps) {
              if (IsThere(path.resolve("./../" + deps.Name + "/index.js"))) {
                imports += "import " + deps.Name + " from \"" + "../"  + deps.Name + "\/index\"\n";
                exports += "  " + deps.Name + ",\n";
              }
            });
            exports += "}";
            // add it to templates
            this.imports = imports;
            this.exports = exports;
            this.atomicSetting = json.plain(componentSettings);
            // now rewrite the settings of the parent component
            this.template("settings.js", path.resolve("./settings.js"));
            this.template("dependencies.js", path.resolve("./dependencies.js"));
            shell.exec("rm -rf " + path.resolve("./../../atomic.json"));
            t.template("_atomic", path.resolve("./../../atomic.json"));
          } else {
            shell.exec("rm -rf " + path.resolve("./atomic.json"));
            t.template("_atomic", path.resolve("./atomic.json"));
          }
        }.bind(t));
      } catch (e) {
        console.log("something went wrong!" + e);
      }
      done();
    }
  },
  // migrations: function() {
  //   var t = this;
  //   _.each(this.atomic.migrations, function(item) {
  //     var output = shell.exec("./script/db-migrate create " + t._.slugify(item.Name));
  //     var migrationFile = output.output.replace("Created migration -- ", "").replace("\n", "");
  //     shell.exec("cp -f " + path.resolve("./src/" + item.Name + "/db-migration.js") + " " + migrationFile);
  //   });
  // }
});

module.exports = AtomicGenerator;
