var _ = require("lodash"),
    shell = require("shelljs"),
    IsThere = require("is-there"),
    path = require("path"),
    registerEverything = require("./registerEverything");

var installComponent = function(repository) {
  try {

    process.setMaxListeners(0);
    // initial if variable not initialized
    var t = this;
    var pathDest = this.isComponentDep ? "../" : "src/";
    this.atomic = this.atomic ? this.atomic : require(path.resolve(this.isComponentDep ? "./../../atomic" : "./atomic"));
    if (!IsThere(pathDest)) {
      this.mkdir(pathDest);
    }
    // get something like component.git
    var getDestination = function(){
      var repo = repository.split("/");
      return repo[repo.length - 1].split(".")[0];
    };
    // clone the component
    var cloneComponent = function() {
      try {
        if (repository) {
          shell.exec("cd " + path.resolve("./" + pathDest) + " && git clone " + repository);
          // if successfuly return the settings of this component
          return require(path.resolve("./" + pathDest + getDestination() + "/settings"));
        } else {
          // this means its a local component
          // which we dont need to install
        }
      }catch (e) {
        // if something went wrong like invalid credentials. try again.
        // FIX ME: if repository doesnt exist it will loop
        return cloneComponent();
      }
    };
    var renameComponentBasedOnName = function(setting) {
      if (pathDest + getDestination() === pathDest + setting.Name) return
      // check if same component already exist
      // if no then rename it based on settings.Name
      if (!IsThere(path.resolve("./" + pathDest + setting.Name))) {
        shell.exec("mv " + pathDest + getDestination() + " " + pathDest + setting.Name);
      } else {
        // if already exists..
        try {
          var depSettings = require(path.resolve("./" + pathDest + setting.Name + "/settings"))
          if (depSettings.version !== setting.version) {
            shell.exec("shopt -s dotglob nullglob && mv " + pathDest + getDestination() + "/* " + pathDest + setting.Name);
            shell.exec("rm -rf " + pathDest + getDestination());
          }
        } catch(err) {
          if (err.code === "MODULE_NOT_FOUND") {
            shell.exec("shopt -s dotglob nullglob && mv " + pathDest + getDestination() + "/* " + pathDest + setting.Name);
            shell.exec("rm -rf " + pathDest + getDestination());
          }
        }
        shell.exec("rm -rf " + pathDest + getDestination());
      }
    };
    // install everting from component settings.AtomicDeps
    var installAtomicDeps = function(atomicDeps) {
      _.each(atomicDeps, function(dependency) {
        installComponent.bind(t)(dependency.Repository);
      });
    };
    var checkIfComponentAlreadyInstalled = function() {
      var found = false;
      this.isNew = true
      _.each(this.atomic.AtomicDeps, function(deps) {
        if (deps.Repository === repository) {
          this.isNew = false
          found = deps;
          // check if the component really exist
          if (!IsThere(path.resolve("./" + pathDest + deps.Name))) {
            found = false;
          } else {
            try {
              var depSettings = require(path.resolve("./" + pathDest + deps.Name + "/settings"))
            } catch(err) {
              if (err.code === "MODULE_NOT_FOUND") {
                found = false
              }
            }
          }
        }
      }.bind(this));
      return found;
    }.bind(this);
    var settings = checkIfComponentAlreadyInstalled();
    if (!settings) {
      // Start cloning the dependency
      settings = cloneComponent();
      renameComponentBasedOnName(settings);
    }
    // install component dependecy first before registering it so that dependencies are registered first.
    installAtomicDeps(settings.AtomicDeps);
    // register the current component now!
    registerEverything.bind(this)(settings);
    if (this.isNew && IsThere(path.resolve("./" + pathDest + settings.Name + "/db-migration.js"))) {
      var output = shell.exec("./" + pathDest + "../script/db-migrate create " + this._.slugify(settings.Name))
      var migrationFile = output.output.replace("Created migration -- ", "").replace("\n", "")
      var result = shell.exec("cp -f " + path.resolve("./" + pathDest + settings.Name + "/db-migration.js") + " " + migrationFile)
    }
    return settings;
  } catch (e) {
    console.log(e);
  }
};

module.exports = installComponent;
