var _ = require("lodash"),
  shell = require("shelljs"),
  IsThere = require("is-there"),
  path = require("path"),
  Promise = require("bluebird"),
  registerEverything = require("./registerEverything");

function exec(command) {
  console.log("Executing: " + command);
  try {
    return shell.exec(command);
  } catch (err) {
    // console.log(err);
  }
}

function installComponent(repository) {
  var t = this;
  console.log("Install Component: " + repository);
  process.setMaxListeners(0);
  var tmpName = "tmp" + (Math.random() * 100);
  // initial if variable not initialized
  var pathDest = this.isComponentDep ? "../" : "src/";
  this.atomic = this.atomic ? this.atomic : require(path.resolve(this.isComponentDep ? "./../../atomic" : "./atomic"));
  if (!IsThere(pathDest)) {
    this.mkdir(pathDest);
  }
  // get something like component.git
  // clone the component
  function cloneComponent() {
    try {
      if (repository) {
        var rootDir = (t.isComponentDep ? path.resolve("./../../") : path.resolve("./")) + "/";
        exec("cd " + rootDir + "src/ && git clone " + repository + " " + tmpName);
        // if successfuly return the settings of this component
        var settings = require(rootDir + "src/" + tmpName + "/settings");
        exec("cd " + rootDir + " && rm -rf src/" + tmpName);
        if (IsThere(rootDir + ".git/modules/src/" + settings.Name)) {
          exec("cd " + rootDir + " && git submodule deinit -f src/" + settings.Name +
          " && git rm src/" + settings.Name + " -f && rm -rf .git/modules/src/" + settings.Name);
        }
        if (IsThere(rootDir + "src/" + settings.Name)) {
          exec("cd " + rootDir + " && rm -rf src/" + settings.Name);
        }
        exec("cd " + rootDir + " && git submodule add -f " + repository + " src/" + settings.Name);
        return require(rootDir + "src/" + settings.Name + "/settings");
      }
    } catch (e) {
      console.log(e);
      // if something went wrong like invalid credentials. try again.
      // FIX ME: if repository doesnt exist it will loop
      return cloneComponent();
    }
  }
  // function getDestination() {
  //   var repo = repository.split("/");
  //   return repo[repo.length - 1].split(".")[0];
  // }
  // install everting from component settings.AtomicDeps
  var installAtomicDeps = function(atomicDeps, index, cb) {
    // console.log("Processing index : " + index);
    if (!atomicDeps[index]) {
      return cb();
    }
    var obj = atomicDeps[index];
    installComponent.bind(this)(obj.Repository).then(function() {
      installAtomicDeps.bind(this)(atomicDeps, index + 1, cb);
    }.bind(this));
  }.bind(this);
  var checkIfComponentAlreadyInstalled = function() {
    var found = false;
    _.each(this.atomic.AtomicDeps, function(deps) {
      if (deps.Repository === repository) {
        found = IsThere(path.resolve("./" + pathDest + deps.Name));
        // console.log("ISTHERE: " + found);
        // check if the component really exist
        try {
          var depSettings = require(path.resolve("./" + pathDest + deps.Name + "/settings"));
          // if (depSettings.Version !== deps.Version) {
            // console.log(depSettings.Name+} +[-setting.Name);-]
          //   shell.exec("rm -rf " + path.resolve("./" + pathDest + deps.Name));
          //   found = false;
          // } else {
            // is already installed
          found = depSettings;
          // }
        } catch (err) {
          // console.log(err);
          if (err.code === "MODULE_NOT_FOUND") {
            found = false;
          }
        }
      }
    }.bind(this));
    return found;
  }.bind(this);
  return new Promise(function(resolve) {
    try {
      var settings = checkIfComponentAlreadyInstalled();
      var isNew = false;
      // console.log("EXISTS: " + !!settings);
      if (!settings) {
        // Start cloning the dependency
        isNew = true;
        settings = cloneComponent();
      }
      // install component dependecy first before registering it so that dependencies are registered first.
      if (settings.AtomicDeps && settings.AtomicDeps.length > 0) {
        installAtomicDeps.bind(t)(settings.AtomicDeps, 0, function() {
          // register the current component now!
          registerEverything.bind(t)(settings);
          if (isNew && IsThere(path.resolve("./" + pathDest + settings.Name + "/db-migration.js"))) {
            // var output = shell.exec("./" + pathDest + "../script/db-migrate create " + this._.slugify(settings.Name));
            // var migrationFile = output.output.replace("Created migration -- ", "").replace("\n", "");
            // shell.exec("cp -f " + path.resolve("./" + pathDest + settings.Name + "/db-migration.js") + " " + migrationFile);
            t.atomic.migrations = t.atomic.migrations || [];
            t.atomic.migrations.push({
              Name: settings.Name
            });
          }
          // return the settings so that it will be configured within the component
          resolve(settings);
        }.bind(t));
      } else {
        registerEverything.bind(t)(settings);
        if (isNew && IsThere(path.resolve("./" + pathDest + settings.Name + "/db-migration.js"))) {
          // var output = shell.exec("./" + pathDest + "../script/db-migrate create " + this._.slugify(settings.Name));
          // var migrationFile = output.output.replace("Created migration -- ", "").replace("\n", "");
          // shell.exec("cp -f " + path.resolve("./" + pathDest + settings.Name + "/db-migration.js") + " " + migrationFile);
          t.atomic.migrations = t.atomic.migrations || [];
          t.atomic.migrations.push({
            Name: settings.Name
          });
        }
        // return the settings so that it will be configured within the component
        resolve(settings);
      }
    } catch (e) {
      throw e;
    }
  });
}

module.exports = installComponent;
