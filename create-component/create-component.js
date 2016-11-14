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

let AtomicGenerator = yeoman.generators.Base.extend({
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
      console.log("DONE")
    })
    // have Yeoman greet the user
    console.log(this.yeoman)

    // replace it with a short and sweet description of your generator
    console.log(chalk.magenta("You're using the Atomic generator."))
    this.fields = []
  },
  async askForComponentDetails() {
    let done = this.async()
    let prompts = [{
      name: "componentName",
      message: "What would you like to call your component?",
      default: "AtomicComponent"
    }, {
      name: "componentRepository",
      message: "What is the repository of this component (blank if same as project repo)?",
      default: ""
    }]

    let detail = await this.prompting(prompts)
    this.componentName = detail.componentName
    this.componentRepository = detail.componentRepository
    this.slugifiedComponentName = this._.slugify(this.componentName)
    this.humanizedComponentName = this._.humanize(this.componentName)
    this.snakeCasedComponentName = this._.underscored(this.componentName)
    this.classifiedComponentName = this._.classify(this.componentName)

    done()
  },
  checkSettings() {
    try {
      this.atomic = require(path.resolve("atomic.json"))
      this.component = {
        "Name": this.componentName,
        "Repository": this.componentRepository,
        "AtomicDeps": []
      }
    } catch (e) {
      console.log("This is not atomic root project")
    }
  },

  async renderComponentAtomicDependencies() {
    let done = this.async()
    this.dependencies = []
    this.imports = ""
    this.exports = "{\n"
    // if there is not repository (this is a local component)
    // if it has a repository.. it will then be stored in src/components

    let prompts = [{
      type: "confirm",
      name: "addDependency",
      message: "You want to add atomic component dependency?",
      default: "Y"
    }]

    let deps = await this.prompting(prompts)
    if (deps.addDependency) {
      let prompt = [
        {
          name: "depRepository",
          message: "What is the repository of this component or relative path to src\/?",
          default: ""
        }
      ]

      let repo = await this.prompting(prompt)
      if (repo.depRepository.split("https").length === 2 || repo.depRepository.split("git@").length === 2) {
        let dependencyInfo = await installComponent.bind(this)(repo.depRepository)
        let d = _.cloneDeep(dependencyInfo)
        delete d.AtomicDeps
        delete d.config
        delete d.dependencies
        this.component.AtomicDeps.push(d)
        this.renderComponentAtomicDependencies()
      } else {
        let dependencyInfo = dependencyInfo = require(path.resolve("./src/" + repo.depRepository + "/settings"))
        // installing local dependency to non-local component is not allowed
        // because...
        if (this.componentRepository !== "" && dependencyInfo.Repository === "") {
          console.log("if your component is not local only then you cannot add a relative component as dependency.")
          this.renderComponentAtomicDependencies()
          return
        }
      }
    } else {
      this.exports += "}"
      done()
    }
  },
  async askForFields() {
    let done = this.async()
    let confirmAddFields = [
      {
        name: "confirm",
        type: "confirm",
        message: "Add Table Field?",
        default: true
      }
    ]
    let confirm = await this.prompting(confirmAddFields)
    if (!confirm.confirm) {
      return done()
    }
    let prompts = [
      {
        name: "fieldName",
        message: "Enter field name:",
        default: ""
      },
      {
        name: "dataType",
        message: "Enter data type:",
        type: "list",
        choices: ["text", "numeric", "integer", "boolean", "date", "datetime", "uuid"],
        default: "text"
      },
      {
        name: "notNull",
        message: "Not Null?:",
        type: "confirm",
        default: false
      },
      {
        name: "defaultValue",
        message: "Enter default value:",
        default: ""
      },
      {
        name: "validator",
        type: "checkbox",
        message: "Select schema validation",
        choices: [
          "isRequired",
          "isUUID",
          "isLength(min, max)",
          "isBool",
          "isPhoneNumber",
          "isInteger",
          "isFloat",
          "isString",
          "isIn(values)",
          "isDate",
          "isArray(schema)",
          "isObject(schema)"
        ]
      },
      {
        name: "linkedTo",
        message: "Linked to other model? (leave blank if not)",
        default: ""
      }
    ]

    let field = await this.prompting(prompts)
    this.fields.push({
      name: field.fieldName,
      type: field.dataType,
      defaults: field.defaultValue,
      validator: field.validator,
      linkedTo: field.linkedTo,
      notNull: field.notNull
    })
    this.askForFields()
  },
  copyApplicationFolder() {
    this.atomic = require(path.resolve("atomic.json"))
    registerEverything.bind(this)(this.component)
    this.config = this.atomic.config
    // generate component variables
    generateVariables.bind(this)(this.atomic)
    // install required NPM Package
    npmInstall.bind(this)(this.atomic)
    this.component = json.plain(this.component)
    this.dependencies = json.plain(this.AtomicDeps)
    this.template("index.js", "src/" + this.classifiedComponentName + "/index.js")
    let schema = []
    if (this.fields.length > 0) {
      this.fieldNames = json.plain(this.fields.map(field => field.name))
      this.validators = []
      this.links = []
      this.fields.map((field, index) => {
        if (field.validator.length > 0) {
          field.validator.map(validator => {
            if (_.indexOf(this.validators, validator) === -1) {
              this.validators.push(validator)
            }
          })
          schema.push({
            name: this._.camelize(field.name),
            validator: field.validator.join(", ")
          })
        }
        if (field.linkedTo) {
          let obj = require(path.resolve(`./src/${field.linkedTo}`))
          this.fields[index].reference = obj.table
          if (_.findIndex(this.links, {path: field.linkedTo}) === -1) {
            this.links.push({
              fk: field.name,
              alias: obj.table,
              name: this._.classify(obj.table),
              path: field.linkedTo
            })
          }
        }
      })
      this.schema = schema
      this.template("model.js", "src/" + this.classifiedComponentName + "/" + this.classifiedComponentName + ".js")
      this.template("migration.js", "src/" + this.classifiedComponentName + "/db-migration.js")
      this.atomic.migrations.push({
        "Name": this.classifiedComponentName
      })
    }
    // rewrite atomic.json
    this.mySettings = json.plain(this.atomic)
    this.template("settings.js", "src/" + this.classifiedComponentName + "/settings.js")
    shell.exec("rm -rf " + path.resolve("atomic.json"))
    this.template("_atomic", path.resolve("atomic.json"))
  },
})

export default AtomicGenerator
