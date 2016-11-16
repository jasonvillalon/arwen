import path from "path"
import _ from "lodash"
import shell from "shelljs"

function npmInstall(atomic) {
  let rootDir = this.isComponentDep ? "./../../" : "./"
  let packages = require(path.resolve(rootDir + "package"))
  _.each(atomic.dependencies, function(version, pack) {
    let installed = !!packages.dependencies[pack]
    if (!installed) {
      shell.exec("npm install --save " + pack + (version !== "" ? "@" + version : ""))
      // set as true (meaning installed)
      atomic.dependencies[pack] = version
    }
  })
}

export default npmInstall
