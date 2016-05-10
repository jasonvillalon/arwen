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
  json = require("format-json");

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
          generateVariables.bind(this)(this.atomic, isComponentDep);
          // generate component variables
          generateVariables.bind(this)();
          // install required NPM Package
          npmInstall.bind(this)(this.atomic);
          // rewrite atomic.json
          this.mySettings = json.plain(this.atomic);
          if (isComponentDep) {
            shell.exec("rm -rf " + path.resolve("./../../atomic.json"));
            this.template("_atomic", path.resolve("./../../atomic.json"));
          } else {
            shell.exec("rm -rf " + path.resolve("./atomic.json"));
            this.template("_atomic", path.resolve("./atomic.json"));
          }
        }.bind(this));
      } catch (e) {
        console.log("something went wrong!" + e);
      }
      done();
    }
  }
});

module.exports = AtomicGenerator;
