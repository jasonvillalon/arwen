var _ = require("lodash");

function registerEverything(settings) {
  var componentFound = false;
  _.each(this.atomic.AtomicDeps, function(existingDeps) {
    if (existingDeps.Name === settings.Name) {
      componentFound = true;
    }
  });
  if (!componentFound) {
    console.log("Registering " + settings.Name);
    var set = _.cloneDeep(settings);
    delete set.AtomicDeps;
    delete set.config;
    delete set.dependencies;
    this.atomic.AtomicDeps.push(set);
  }
  this.atomic.config = this.atomic.config ? this.atomic.config : {};
  _.defaultsDeep(this.atomic.config, settings.config);
  this.atomic.dependencies = this.atomic.dependencies ? this.atomic.dependencies : {};
  _.each(settings.dependencies, function(version, npmPackage) {
    if (!this.atomic.dependencies[npmPackage]) {
      // set as false.. meaning not installed
      this.atomic.dependencies[npmPackage] = version;
    }
  }.bind(this));
}

module.exports = registerEverything;
