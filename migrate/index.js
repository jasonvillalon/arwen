"use strict";
var
  path = require("path"),
  yeoman = require("yeoman-generator"),
  chalk = require("chalk"),
  shell = require("shelljs"),
  IsThere = require("is-there"),
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
  migrations: function() {
    var t = this;
    t.atomic = require(path.resolve("./atomic"));
    _.each(t.atomic.migrations, function(item, index) {
      if (!item.created && IsThere(path.resolve("./src/" + item.Name + "/db-migration.js"))) {
        var output = shell.exec("./script/db-migrate create " + t._.slugify(item.Name));
        var migrationFile = output.output.replace("Created migration -- ", "").replace("\n", "");
        migrationFile = migrationFile.match(/(\/[^/ ]*)+\/?/g);
        var cmd = "cp -f " + path.resolve("./src/" + item.Name + "/db-migration.js") + " " + migrationFile;
        // console.log(cmd);
        shell.exec(cmd, {silent: true}, function() {
          // console.log(ress);
          console.log("Done Create Migrate File");
        });
        // console.log(result);
        t.atomic.migrations[index].created = true;
      }
    });
    t.mySettings = json.plain(t.atomic);
    shell.exec("rm -rf " + path.resolve("./atomic.json"));
    t.template("_atomic", path.resolve("./atomic.json"));
  }
});

module.exports = AtomicGenerator;
