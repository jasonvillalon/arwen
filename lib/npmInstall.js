var path = require("path"),
  _ = require("lodash"),
  shell = require("shelljs");

function npmInstall(atomic) {
  var root = this.isComponentDep ? "./../../" : "./";
  var packages = require(path.resolve(root + "package"));
  _.each(atomic.dependencies, function(version, package) {
    var installed = !!packages.dependencies[package];
    if (!installed) {
      shell.exec("npm install --save " + package + (version !== "" ? "@" + version : ""));
      // set as true (meaning installed)
      atomic.dependencies[package] = version;
    }
  });
}

module.exports = npmInstall;
