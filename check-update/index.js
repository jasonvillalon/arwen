"use strict";
var path = require("path"),
  yeoman = require("yeoman-generator"),
  chalk = require("chalk"),
  fs = require("fs"),
  IsThere = require("is-there"),
  exec = require("child_process").exec;

var AtomusGenerator = yeoman.generators.Base.extend({
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
    var currentComponentIndex = 0;
    function pullChanges(components, indexComponent) {
      var component = components[indexComponent];
      if (component !== undefined) {
        if (IsThere(path.resolve("./src/" + component + "/.git"))) {
          console.log("Checking " + component);
          exec("cd " + path.resolve("./src/" + component) + " && git pull", function(error, stdout) {
            console.log(stdout);
            currentComponentIndex += 1;
            pullChanges(components, currentComponentIndex);
          });
        } else {
          currentComponentIndex += 1;
          pullChanges(components, currentComponentIndex);
        }
      } else {
        done();
      }
    }
    fs.readdir(path.resolve("./src"), function(err, components) {
      pullChanges(components, currentComponentIndex);
    });
  }
});

module.exports = AtomusGenerator;
