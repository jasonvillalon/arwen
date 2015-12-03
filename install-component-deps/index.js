'use strict';
var util = require('util'),
  path = require('path'),
  yeoman = require('yeoman-generator'),
  chalk = require('chalk'),
  shell = require('shelljs'),
  _ = require("lodash"),
  fs = require("fs"),
  installComponent = require("../lib/installComponent"),
  registerEverything = require("../lib/registerEverything"),
  generateVariables = require("../lib/generateVariables"),
  npmInstall = require("../lib/npmInstall"),
  json = require('format-json');

var AtomicGenerator = yeoman.generators.Base.extend({
  init: function(){
    // invoke npm install on finish
    this.on('end', function() {
      // if (!this.options['skip-install']) {
      //   this.npmInstall();
      // }
    });
    // have Yeoman greet the user
    console.log(this.yeoman);

    // replace it with a short and sweet description of your generator
    console.log(chalk.magenta('You\'re using the Atomic generator.'));
  },
  installer: function() {
    var done = this.async();
    this.isComponentDep = false;
    var t = this;
    var getSettings = function() {
      var settings = null;
      try {
        settings = require(path.resolve("./settings"));
        this.isComponentDep = true;
        return settings;
      } catch (e2) {
        this.atomic = require(path.resolve("./atomic"));
        return this.atomic;
      }
    }.bind(this);

    var componentSettings = getSettings();
    if (!componentSettings) {
      console.log("This is not a valid project to install a component!")
      done();
    } else {
      try {
        _.each(componentSettings.AtomicDeps, function(deps) {
          installComponent.bind(t)(deps.Repository);
        });
        // register the current component now!
        if (this.isComponentDep) {
          this.atomic = require(path.resolve("./../../atomic"));
          registerEverything.bind(this)(componentSettings);
        }
        // generate component variables
        generateVariables.bind(this)();
        // install required NPM Package
        npmInstall.bind(this)(this.atomic);
        // rewrite atomic.json
        this.mySettings = json.plain(this.atomic);
        if (this.isComponentDep) {
          shell.exec("rm -rf " + path.resolve("./../../atomic.json"));
          this.template("_atomic", path.resolve("./../../atomic.json"));
        } else {
          shell.exec("rm -rf " + path.resolve("./atomic.json"));
          this.template("_atomic", path.resolve("./atomic.json"));
        }
      }catch(e) {
        console.log("something went wrong!" + e);
      }
      done();
    }
  }
});

module.exports = AtomicGenerator;
