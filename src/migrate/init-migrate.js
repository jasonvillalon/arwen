import path from "path"
import yeoman from "yeoman-generator"
import chalk from "chalk"
import shell from "shelljs"
import IsThere from "is-there"
import json from "format-json"
import _ from "lodash"

const AtomicGenerator = yeoman.generators.Base.extend({
  init() {
    // invoke npm install on finish
    this.on("end", function() {
      // if (!this.options["skip-install"]) {
      //   this.npmInstall()
      // }
    })
    // have Yeoman greet the user
    console.log(this.yeoman)

    // replace it with a short and sweet description of your generator
    console.log(chalk.magenta("You\"re using the Atomic generator."))
  },
  migrations() {
    this.atomic = require(path.resolve("./atomic"))
    _.each(this.atomic.migrations, (item, index) => {
      if (!item.created && IsThere(path.resolve("./src/" + item.Name + "/db-migration.js"))) {
        let output = shell.exec("./script/db-migrate create " + this._.slugify(item.Name))
        let migrationFile = output.output.replace("Created migration -- ", "").replace("\n", "")
        console.log(migrationFile)
        migrationFile = migrationFile.match(/(\/[^/ ]*)+\/*.js/g)
        console.log(migrationFile)
        console.log("COPY: " + path.resolve("./src/" + item.Name + "/db-migration.js") + " to " + migrationFile[migrationFile.length - 1])
        let cmd = "cp -f " + path.resolve("./src/" + item.Name + "/db-migration.js") + " " + migrationFile[migrationFile.length - 1]
        // console.log(cmd)
        shell.exec(cmd, {silent: true}, function() {
          // console.log(ress)
          console.log("Done Create Migrate File")
        })
        // console.log(result)
        this.atomic.migrations[index].created = true
      }
    })
    this.mySettings = json.plain(this.atomic)
    shell.exec("rm -rf " + path.resolve("./atomic.json"))
    this.template("_atomic", path.resolve("./atomic.json"))
  }
})

export default AtomicGenerator
