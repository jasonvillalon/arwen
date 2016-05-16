"use strict";
var path = require("path"),
  yeoman = require("yeoman-generator"),
  chalk = require("chalk"),
  shell = require("shelljs"),
  IsThere = require("is-there"),
  fs = require("fs");

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
  check: function() {
    var done = this.async();
    var t = this;
    var currentComponentIndex = 0;
    function askForCommentThenPush(components, component) {
      var prompts = [{
        name: "commitComment",
        message: "You are commiting changes from: " + component + " Component. Please add comment:",
        default: "Fixing some bugs..."
      }];

      t.prompt(prompts, function(props) {
        shell.exec("cd " + path.resolve("./src/" + component) + " && git add --all");
        shell.exec("cd " + path.resolve("./src/" + component) + " && git commit -m \"" + props.commitComment + "\"");
        shell.exec("cd " + path.resolve("./src/" + component) + " && git push origin master");
        currentComponentIndex += 1;
        commitChanges(components, currentComponentIndex);
      });
    }
    function commitChanges(components, indexComponent) {
      var component = components[indexComponent];
      if (component !== undefined) {
        if (IsThere(path.resolve("./src/" + component + "/.git"))) {
          console.log("Checking " + component);
          shell.exec("cd " + path.resolve("./src/" + component) + " && git diff");
          var status = shell.exec("cd " + path.resolve("./src/" + component) + " && git status");
          if (status.output.split("modified:").length >= 2 || status.output.split("Untracked files:").length >= 2 || status.output.split("deleted:").length >= 2) {
            askForCommentThenPush(components, component);
          } else {
            currentComponentIndex += 1;
            commitChanges(components, currentComponentIndex);
          }
        } else {
          currentComponentIndex += 1;
          commitChanges(components, currentComponentIndex);
        }
      } else {
        done();
      }
    }
    fs.readdir(path.resolve("./src"), function(err, components) {
      commitChanges(components, currentComponentIndex);
    });
  }
});

module.exports = AtomicGenerator;
