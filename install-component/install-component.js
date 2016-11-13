import path from "path"
import yeoman from "yeoman-generator"
import chalk from "chalk"
import shell from "shelljs"
import _ from "lodash"
import json from "format-json"
import installComponent from "../lib/install-component"
import registerEverything from "../lib/register-everything"
import generateVariables from "../lib/generate-variables"
import npmInstall from "../lib/npm-install"

var AtomicGenerator = yeoman.generators.Base.extend({
  prompting(prompt) {
    return new Promise(resolve => {
      try {
        this.prompt(prompt, (props) => {
          resolve(props)
        })
      } catch (err) {

      }
    })
  },
  init() {
    // invoke npm install on finish
    this.on("end", function() {
      // shell.exec("yo restify:install-component-deps")
      console.log("DONE")
    })
    // have Yeoman greet the user
    console.log(this.yeoman)

    // replace it with a short and sweet description of your generator
    console.log(chalk.magenta("You\"re using the Atomic generator."))
  },
  async askForComponentRepo() {
    var done = this.async()
    var prompts = [
      {
        name: "repository",
        message: "git repository or relative path to \/src/",
        default: ""
      }
    ]

    // Ask the repository of the component to be installed
    let repo = await this.prompting(prompts)
    var pathDest = "../"
    this.repository = repo.repository
    this.isComponentDep = false
    // we are installing a component as a dependency of another
    var getSettings = () => {
      var settings = null
      try {
        settings = require(path.resolve("./settings"))
        this.isComponentDep = true
        return settings
      } catch (e2) {
        return false
      }
    }
    this.atomicSetting = getSettings()

    var registerAll = (dependencyInfo) => {
      this.atomic = this.isComponentDep ? require(path.resolve("./../../atomic")) : require(path.resolve("./atomic"))
      registerEverything.bind(this)(dependencyInfo)

      this.config = this.atomic.config
      // generate component variables
      generateVariables.bind(this)()
      // install required NPM Package
      npmInstall.bind(this)(this.atomic)
      // rewrite atomic.json
      this.mySettings = json.plain(this.atomic)
      shell.exec("rm -rf " + path.resolve("./../../atomic.json"))
      this.template("_atomic", path.resolve("./../../atomic.json"))

      try {
        var d = _.cloneDeep(dependencyInfo)
        delete d.AtomicDeps
        delete d.config
        delete d.dependencies
        // add the information of installed component to its parent component or to the project
        // if the parent is just another component. do this
        if (this.isComponentDep) {
          this.atomicSetting.AtomicDeps.push(d)
          // create the dependencies.js content
          // so what we need to do is just read the previous settigns and add the new component to it
          // then rewrite everything in settings.js and dependencies.js
          this.atomicSetting = json.plain(this.atomicSetting)
          // now rewrite the settings of the parent component
          this.template("settings.js", path.resolve("./settings.js"))
        } else {
          this.mySettings.AtomicDeps.push(d)
          this.mySettings = json.plain(this.mySettings)
          // now rewrite the settings of the parent component
          this.template("_atomic", path.resolve("./atomic.json"))
        }
      } catch (e) {
        console.log("something went wrong!" + e)
      }
      done()
    }
    pathDest = "../"
    // install the dependency component
    if (this.repository.split("https:\/\/").length === 2 || this.repository.split("git@").length === 2) {
      let dependencyInfo = installComponent.bind(this)(this.repository)
      registerAll(dependencyInfo)
    } else {
      var dependencyInfo = require(path.resolve(pathDest + this.repository + "/settings"))
      registerAll(dependencyInfo)
    }
  }
})

module.exports = AtomicGenerator
