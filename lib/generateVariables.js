var _ = require("lodash"),
  shell = require("shelljs"),
  path = require("path"),
  json = require('format-json');

var generateVariables = function() {
  this.config = json.plain(this.atomic.config);
  var root = this.isComponentDep ? "./../../" : "./"
  shell.exec("rm -rf " + path.resolve(root + "config/default.js"));
  this.template("default.js", path.resolve(root + "config/default.js"));
};

module.exports = generateVariables;
