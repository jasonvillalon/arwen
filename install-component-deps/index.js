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
  _ = require("lodash");

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
    var isComponentDep = false;
    var t = this;
    var getSettings = function() {
      var settings = null;
      try {
        settings = require(path.resolve("./settings"));
        isComponentDep = true;
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
      installComponent.bind(t)(obj.Repository, isComponentDep).then(function() {
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
          if (isComponentDep) {
            this.atomic = require(path.resolve("./../../atomic"));
            registerEverything.bind(this)(componentSettings);
          }
          // generate component variables
          generateVariables.bind(t)(this.atomic, isComponentDep);
          // install required NPM Package
          npmInstall.bind(t)(t.atomic);
          // rewrite atomic.json
          t.mySettings = json.plain(t.atomic);
          if (isComponentDep) {
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
