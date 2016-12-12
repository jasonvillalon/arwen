// import shell from "shelljs"
import path from "path"
import json from "format-json"

function generateVariables() {
  this.config = json.plain(this.atomic.config)
  let rootDir = this.isComponentDep ? "./../../" : "./"
  // shell.exec("rm -rf " + path.resolve(rootDir + "config/default.js"))
  this.template("default.js", path.resolve(rootDir + "config/default.js"))
}

export default generateVariables
