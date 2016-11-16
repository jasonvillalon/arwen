import _  from "lodash"
import shell from "shelljs"
import IsThere from "is-there"
import path from "path"
import registerEverything from "./register-everything"

function exec(command) {
  console.log("Executing: " + command)
  try {
    return shell.exec(command)
  } catch (err) {
    // console.log(err)
  }
}

function installComponent(repository) {
  let t = this
  console.log("Install Component: " + repository)
  process.setMaxListeners(0)
  let tmpName = "tmp" + (Math.random() * 100)
  let pathDest = this.isComponentDep ? "../" : "src/"
  this.atomic = this.atomic ? this.atomic : require(path.resolve(this.isComponentDep ? "./../../atomic" : "./atomic"))
  if (!IsThere(pathDest)) {
    this.mkdir(pathDest)
  }
  function cloneComponent() {
    try {
      if (repository) {
        let rootDir = (t.isComponentDep ? path.resolve("./../../") : path.resolve("./")) + "/"
        exec("cd " + rootDir + "src/ && git clone " + repository + " " + tmpName)
        let settings = require(rootDir + "src/" + tmpName + "/settings")
        exec("cd " + rootDir + " && rm -rf src/" + tmpName)
        if (IsThere(rootDir + ".git/modules/src/" + settings.Name)) {
          exec("cd " + rootDir + " && git submodule deinit -f src/" + settings.Name +
          " && git rm src/" + settings.Name + " -f && rm -rf .git/modules/src/" + settings.Name)
        }
        if (IsThere(rootDir + "src/" + settings.Name)) {
          exec("cd " + rootDir + " && rm -rf src/" + settings.Name)
        }
        exec("cd " + rootDir + " && git submodule add -f " + repository + " src/" + settings.Name)
        return require(rootDir + "src/" + settings.Name + "/settings")
      }
    } catch (e) {
      console.log(e)
      return cloneComponent()
    }
  }
  let installAtomicDeps = async (atomicDeps, index) => {
    if (!atomicDeps[index]) {
      return
    }
    let obj = atomicDeps[index]
    await installComponent.bind(this)(obj.Repository)
    return await installAtomicDeps.bind(this)(atomicDeps, index + 1)
  }
  let checkIfComponentAlreadyInstalled = () => {
    let found = false
    _.each(this.atomic.AtomicDeps, (deps) => {
      if (deps.Repository === repository) {
        found = IsThere(path.resolve("./" + pathDest + deps.Name))
        try {
          let depSettings = require(path.resolve("./" + pathDest + deps.Name + "/settings"))
          found = depSettings
        } catch (err) {
          // console.log(err)
          if (err.code === "MODULE_NOT_FOUND") {
            found = false
          }
        }
      }
    })
    return found
  }
  return new Promise(async (resolve) => {
    try {
      let settings = checkIfComponentAlreadyInstalled()
      let isNew = false
      if (!settings) {
        isNew = true
        settings = cloneComponent()
      }
      if (settings.AtomicDeps && settings.AtomicDeps.length > 0) {
        await installAtomicDeps.bind(t)(settings.AtomicDeps, 0)
        registerEverything.bind(t)(settings)
        if (isNew && IsThere(path.resolve("./" + pathDest + settings.Name + "/db-migration.js"))) {
          t.atomic.migrations = t.atomic.migrations || []
          t.atomic.migrations.push({
            Name: settings.Name
          })
        }
        resolve(settings)
      } else {
        registerEverything.bind(t)(settings)
        if (isNew && IsThere(path.resolve("./" + pathDest + settings.Name + "/db-migration.js"))) {
          t.atomic.migrations = t.atomic.migrations || []
          t.atomic.migrations.push({
            Name: settings.Name
          })
        }
        resolve(settings)
      }
    } catch (e) {
      throw e
    }
  })
}

export default installComponent
