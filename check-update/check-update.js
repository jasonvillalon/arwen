import path from "path"
import yeoman from "yeoman-generator"
import chalk from "chalk"
import fs from "fs"
import IsThere from "is-there"
import {exec} from "child_process"

const AtomusGenerator = yeoman.generators.Base.extend({
  init: function() {
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
  check: function() {
    let done = this.async()
    let currentComponentIndex = 0
    function pullChanges(components, indexComponent) {
      let component = components[indexComponent]
      if (component !== undefined) {
        if (IsThere(path.resolve("./src/" + component + "/.git"))) {
          console.log("Checking " + component)
          exec("cd " + path.resolve("./src/" + component) + " && git pull", function(error, stdout) {
            console.log(stdout)
            currentComponentIndex += 1
            pullChanges(components, currentComponentIndex)
          })
        } else {
          currentComponentIndex += 1
          pullChanges(components, currentComponentIndex)
        }
      } else {
        done()
      }
    }
    fs.readdir(path.resolve("./src"), function(err, components) {
      pullChanges(components, currentComponentIndex)
    })
  }
})

export default AtomusGenerator
