"use strict";
var path = require("path"),
  yeoman = require("yeoman-generator"),
  chalk = require("chalk"),
  shell = require("shelljs"),
  _ = require("lodash"),
  json = require("format-json"),
  installComponent = require("../lib/installComponent"),
  registerEverything = require("../lib/registerEverything"),
  generateVariables = require("../lib/generateVariables"),
  npmInstall = require("../lib/npmInstall");

var AtomicGenerator = yeoman.generators.Base.extend({
  init: function() {
    // invoke npm install on finish
    this.on("end", function() {
      // shell.exec("yo restify:install-component-deps");
      console.log("DONE");
    });
    // have Yeoman greet the user
    console.log(this.yeoman);

    // replace it with a short and sweet description of your generator
    console.log(chalk.magenta("You\"re using the Atomic generator."));
  },
  askForComponentRepo: function() {
    var done = this.async();
    var prompts = [
      {
        name: "repository",
        message: "git repository or relative path to \/src/",
        default: ""
      }
    ];

    // Ask the repository of the component to be installed
    this.prompt(prompts, function(props) {
      var pathDest = "../";
      this.repository = props.repository;
      this.isComponentDep = false;
      // we are installing a component as a dependency of another
      var getSettings = function() {
        var settings = null;
        try {
          settings = require(path.resolve("./settings"));
          this.isComponentDep = true;
          return settings;
        } catch (e2) {
          return false;
        }
      }.bind(this);

      var registerAll = function(dependencyInfo) {
        this.atomic = require(path.resolve("./../../atomic"));
        registerEverything.bind(this)(dependencyInfo);

        this.config = this.atomic.config;
        // generate component variables
        generateVariables.bind(this)();
        // install required NPM Package
        npmInstall.bind(this)(this.atomic);
        // rewrite atomic.json
        this.mySettings = json.plain(this.atomic);
        shell.exec("rm -rf " + path.resolve("./../../atomic.json"));
        this.template("_atomic", path.resolve("./../../atomic.json"));

        try {
          var d = _.cloneDeep(dependencyInfo);
          delete d.AtomicDeps;
          delete d.config;
          delete d.dependencies;
          // add the information of installed component to its parent component or to the project
          this.atomicSetting.AtomicDeps.push(d);
          // if the parent is just another component. do this
          if (this.isComponentDep) {
            // create the dependencies.js content
            // so what we need to do is just read the previous settigns and add the new component to it
            // then rewrite everything in settings.js and dependencies.js
            this.atomicSetting = json.plain(this.atomicSetting);
            // now rewrite the settings of the parent component
            this.template("settings.js", path.resolve("./settings.js"));
          }
        } catch (e) {
          console.log("something went wrong!" + e);
        }
        done();
      }.bind(this);
      this.atomicSetting = getSettings();
      pathDest = "../";
      if (!this.atomicSetting) {
        console.log("You must only install a component to another component.");
        done();
      }
      // install the dependency component
      if (this.repository.split("https:\/\/").length === 2 || this.repository.split("git@").length === 2) {
        installComponent.bind(this)(this.repository).then(function(dependencyInfo) {
          registerAll(dependencyInfo);
        });
      } else {
        var dependencyInfo = require(path.resolve(pathDest + this.repository + "/settings"));
        registerAll(dependencyInfo);
      }
    }.bind(this));
  }
});

module.exports = AtomicGenerator;
