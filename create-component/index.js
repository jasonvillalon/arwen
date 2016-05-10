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
      // var dest = "./src/" + this.classifiedComponentName;
      // shell.exec("cd " + dest + " && yo restify:install-component-deps");
      console.log("DONE");
    });
    // have Yeoman greet the user
    console.log(this.yeoman);

    // replace it with a short and sweet description of your generator
    console.log(chalk.magenta("You're using the Atomic generator."));
  },
  askForComponentDetails: function() {
    var done = this.async();

    var prompts = [{
      name: "componentName",
      message: "What would you like to call your component?",
      default: "AtomicComponent"
    }, {
      name: "componentRepository",
      message: "What is the repository of this component (blank if same as project repo)?",
      default: ""
    }];

    this.prompt(prompts, function(props) {
      this.componentName = props.componentName;
      this.componentRepository = props.componentRepository;

      this.slugifiedComponentName = this._.slugify(this.componentName);
      this.humanizedComponentName = this._.humanize(this.componentName);
      this.classifiedComponentName = this._.classify(this.componentName);

      done();
    }.bind(this));
  },
  checkSettings: function() {
    var done = this.async();
    try {
      this.atomic = require(path.resolve("atomic.json"));
      this.component = {
        "Name": this.componentName,
        "Repository": this.componentRepository,
        "AtomicDeps": []
      };
      done();
    } catch (e) {
      console.log("This is not atomic root project");
    }
  },

  renderComponentAtomicDependencies: function() {
    var done = this.async();
    this.dependencies = [];
    this.imports = "";
    this.exports = "{\n";
    // if there is not repository (this is a local component)
    // if it has a repository.. it will then be stored in src/components
    var dest = "../";

    var askForAtomDeps = function() {
      var prompts = [{
        type: "confirm",
        name: "addDependency",
        message: "You want to add atomic component dependency?",
        default: "Y"
      }];

      this.prompt(prompts, function(props) {
        if (props.addDependency) {
          var prompt = [
            {
              name: "depRepository",
              message: "What is the repository of this component or relative path to src\/?",
              default: ""
            }
          ];

          this.prompt(prompt, function(prop) {
            if (prop.depRepository.split("https").length === 2 || prop.depRepository.split("git@").length === 2) {
              installComponent.bind(this)(prop.depRepository).then(function(dependencyInfo) {
                this.imports += "import " + dependencyInfo.Name + " from \"" + dest + dependencyInfo.Name + "\/index\"\n";
                this.exports += "\t" + dependencyInfo.Name + ",\n";
                var d = _.cloneDeep(dependencyInfo);
                delete d.AtomicDeps;
                delete d.config;
                delete d.dependencies;
                this.component.AtomicDeps.push(d);
                askForAtomDeps();
              });
            } else {
              var dependencyInfo = dependencyInfo = require(path.resolve("./src/" + prop.depRepository + "/settings"));
              // installing local dependency to non-local component is not allowed
              // because...
              if (this.componentRepository !== "" && dependencyInfo.Repository === "") {
                console.log("if your component is not local only then you cannot add a relative component as dependency.");
                askForAtomDeps();
                return;
              }
            }
          }.bind(this));
        } else {
          this.exports += "}";
          done();
        }
      }.bind(this));
    }.bind(this);
    askForAtomDeps();
  },
  copyApplicationFolder: function() {
    this.atomic = require(path.resolve("atomic.json"));
    registerEverything.bind(this)(this.component);
    this.config = this.atomic.config;
    // generate component variables
    generateVariables.bind(this)(this.atomic);
    // install required NPM Package
    npmInstall.bind(this)(this.atomic);
    // rewrite atomic.json
    this.mySettings = json.plain(this.atomic);
    this.component = json.plain(this.component);
    shell.exec("rm -rf " + path.resolve("atomic.json"));
    this.template("_atomic", path.resolve("atomic.json"));
    this.dependencies = json.plain(this.AtomicDeps);
    this.template("index.js", "src/" + this.classifiedComponentName + "/index.js");
    this.template("dependencies.js", "src/" + this.classifiedComponentName + "/dependencies.js");
    this.template("settings.js", "src/" + this.classifiedComponentName + "/settings.js");
  },
});

module.exports = AtomicGenerator;
