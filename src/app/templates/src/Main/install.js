import isThere from "is-there"
import json from "format-json"
import fs from "fs-extra-promise"
import config from "config"
import path from "path"
import shell from "shelljs"

function exec(command) {
  // console.log("Executing: " + command)
  return new Promise(function(resolve) {
    shell.exec(command, {}, function(code, stdout, stderr) {
      // console.log("Exit code:", code)
      // console.log("Program output:", stdout)
      // console.log("Program stderr:", stderr)
      if (stderr) {
        resolve(stderr)
      } else {
        resolve()
      }
    })
  })
}

async function installfrontend() {
  try {
    await fs.ensureDirAsync(config.get("frontend.path"))
    let isChanged = false
    let newPackage
    if (
      isThere("installed/node_modules") &&
      isThere("installed/jspm_packages") &&
      isThere("installed/bower_components")
    ) {
      let currPackage = require(path.resolve("./installed/package.json"))
      console.log("CUR VERSION", currPackage.version)
      try {
        await exec("cd installed/; git pull origin master")
      } catch (err) {

      }
      delete require.cache[path.resolve("./installed/package.json")]
      newPackage = require(path.resolve("./installed/package.json"))
      console.log("NEW VERSION: ", newPackage.version)
      if (currPackage.version !== newPackage.version) {
        isChanged = true
      }
    } else {
      if (!isThere("installed")) {
        await exec("git clone git@bitbucket.org:codehoodph/kineo-frontend.git installed --recurse-submodules")
      }
      await exec("cd installed; npm install && ~/.nvm/versions/node/v6.8.0/bin/jspm install && ~/.nvm/versions/node/v6.8.0/bin/bower install --allow-root")
      newPackage = require(path.resolve("./installed/package.json"))
      isChanged = true
    }
    let built
    built = isThere(`${config.get("frontend.path")}/index.html`)
    console.log(" isChanged: ", isChanged)
    if (isChanged || !built) {
      let variables = require(path.resolve("./installed/src/variables")).default
      // console.log(variables)
      variables.baseHref = config.get("baseHref")
      variables.imageUrl = `${config.get("baseHref")}/images/`
      let protocol
      try {
        protocol = !!config.get("crtFile") && !!config.get("keyFile") ? "https://" : "http://"
      } catch (err) {
        protocol = "http://"
      }
      variables.domain = `${protocol}${config.get("api.server.name")}${config.get("baseHref")}`
      variables.apiUrl = `${protocol}${config.get("api.server.host")}${config.get("baseHref")}/api`
      await new Promise((resolve, reject) => {
        fs.writeFile(path.resolve("./installed/src/variables.js"), `export default ${json.plain(variables)}`, function(err) {
          if (err) {
            console.log(err)
            reject(err)
          }
          console.log("The file was saved!")
          resolve()
        })
      })
      shell.sed("-i", /\$image-url = '\/images\/'/, `$image-url = '${config.get("baseHref")}/images/'`, path.resolve("./installed/src/variables.styl"))
      await exec("cd installed; node_modules/gulp/bin/gulp.js build --release")
      await exec(`cd installed; cp -rf www/* ${path.resolve(`${config.get("frontend.path")}/`)}`)
    }
  } catch (err) {
    console.log(err)
  }
}

export default async function() {
  if (config.get("useStatics")) {
    await installfrontend()
    process.exit()
  }
}
