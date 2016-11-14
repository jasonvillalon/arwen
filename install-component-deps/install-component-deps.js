import path from "path"
import yeoman from "yeoman-generator"
import chalk from "chalk"
import shell from "shelljs"
import installComponent from "../lib/install-component"
import registerEverything from "../lib/register-everything"
import generateVariables from "../lib/generate-variables"
import npmInstall from "../lib/npm-install"
import json from "format-json"

var AtomicGenerator = yeoman.generators.Base.extend({
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
  async installer() {
    var done = this.async()
    this.isComponentDep = false
    var getSettings = () => {
      var settings = null
      try {
        this.atomic = require(path.resolve("../../atomic"))
        settings = require(path.resolve("./settings"))
        this.isComponentDep = true
        return settings
      } catch (e2) {
        this.atomic = require(path.resolve("./atomic"))
        return this.atomic
      }
    }
    let installEach = async (atomicDeps, index) => {
      if (!atomicDeps[index]) {
        return
      }
      var obj = atomicDeps[index]
      await installComponent.bind(this)(obj.Repository)
      return await installEach(atomicDeps, index + 1)
    }
    var componentSettings = getSettings()
    if (!componentSettings) {
      console.log("This is not a valid project to install a component!")
      done()
    } else {
      try {
        await installEach(componentSettings.AtomicDeps, 0)
        // register the current component now!
        if (this.isComponentDep) {
          this.atomic = require(path.resolve("./../../atomic"))
          registerEverything.bind(this)(componentSettings)
        }
        // generate component variables
        generateVariables.bind(this)(this.atomic, this.isComponentDep)
        // install required NPM Package
        npmInstall.bind(this)(this.atomic)
        // rewrite atomic.json
        this.mySettings = json.plain(this.atomic)
        if (this.isComponentDep) {
          this.atomicSetting = json.plain(componentSettings)
          // now rewrite the settings of the parent component
          this.template("settings.js", path.resolve("./settings.js"))
          shell.exec("rm -rf " + path.resolve("./../../atomic.json"))
          this.template("_atomic", path.resolve("./../../atomic.json"))
        } else {
          shell.exec("rm -rf " + path.resolve("./atomic.json"))
          this.template("_atomic", path.resolve("./atomic.json"))
        }
      } catch (e) {
        console.log("something went wrong!" + e)
      }
      done()
    }
  },
})

export default AtomicGenerator
