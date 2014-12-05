// Object for getting ad writing data to and from the file

var fs = require('fs'),
  defConfig = require("../config.json"), // default config (may be removed in future)
  optimist = require('optimist'),
  path  = require("path"),
  semver = require('semver');

// Initialize + load data
function DataGetter(config, base) {
  this.config = config;
  this.fielPath = "";
  this.data = {};

  // Make the path to the db file
  this.filePath = this.buildPath(base); // in case we want to use another base path
}

// Connect the base together with the location of wakefile from configuration to make a path to the wake file
DataGetter.prototype.buildPath = function(base) {
  return path.join(base, this.config.wakefile);
};

// Get data from the file. Make a new file in case the file does not exit yet
DataGetter.prototype.getDataFromFile = function(cb, assign){
  var self = this;

  // if we don't specify assign flag
  if (typeof assign !== "boolean") {
    assign = true;
  }

  fs.exists(self.filePath, function(exists){
    if (exists) {
      // Read and parse the saved file
      fs.readFile(self.filePath, function(err, data){
        if (err) {
          return cb(err, null); // Error while reading file
        }
        self.parseFileData(data.toString(), function(err, data){
          if (err) {
            return cb(err, null); // Error while parsing
          }
          if (assign) { // If we want to assign the data on success
            self.data = data;
          }
          return cb(null, data); // Parsed and processed data
        });
      });
    } else {
      // Make a new file
      var data = self.makeNewData();
      if (assign) { // If we want to assign the data on success
        self.data = data;
      }
      return cb(null, data);
    }
  });
};

DataGetter.prototype.parseFileData = function(strData, cb){
  var data = {};

  if (typeof strData !== "string") {
    data = strData;
    return cb(null, data);
  }

  try {
    data = JSON.parse(strData);
    data = this.serialize(data);
  } catch (err) {
    return cb(err, null);
  }

  // if the version of the file is less then the version of the program, fix the old format
  if (semver.lt(data.version, this.config.version)) {
    data = this.fixOldFormat(data);
  }
  return cb(null, data);
};

// Return new initialized data object
DataGetter.prototype.makeNewData = function(initialData) {
  var data = { // Initialize and object with array of saved macs and version number
    version: this.config.version,
    saved_macs: []
  };
  if (typeof initialData === "object") { // apply initial data provided;
    data = initialData;
  }
  return data;
};

// Fixes any format changes from the last version
DataGetter.prototype.fixOldFormat = function(data) {
  // fix old format of 'lastUse' field
  for (var i = 0; i < data.saved_macs.length; i++) {
    if (data.saved_macs[i].lastUse === "never") {
      data.saved_macs[i].lastUse = -Infinity;
    }
  };

  data.version = this.config.version; // Update the file to the current version;
  return data;
};

// serialize the data
DataGetter.prototype.serialize = function(data) {
  var lastUse = null;
  for (var i = 0; i < data.saved_macs.length; i++) {
    lastUse = data.saved_macs[i].lastUse;
    if (lastUse === null) {
      data.saved_macs[i].lastUse = -Infinity;
    }
  }
  return data;
};

// Get the list of saved items
DataGetter.prototype.getItems = function() {
  return this.data.saved_macs;
};

// Return the element of given name, return false if not found
DataGetter.prototype.getItemByName = function(name) {
  var list = this.getItems();

  for (var index in list) {
    if (list[index].name == name) {
      return list[index];
    }
  }
  return -1;
};

// Return the index of device in array
DataGetter.prototype.indexOfDev = function(name) {
  var devices = this.getItems();
  for (var i = 0; i < devices.length; i++) {
    if (devices[i].name == name) {
      return i;
    }
  }
  return -1;
};

// Does the device exist?
DataGetter.prototype.deviceExists = function(name) {
  return this.indexOfDev(name) !== -1;
};

// Add device to data list
DataGetter.prototype.addItem = function(device) {
  return this.data.saved_macs.push(device);
};

// remove device from data list
DataGetter.prototype.removeItem = function(name) {
  var i = this.indexOfDev(name);
  return this.data.saved_macs.splice(i, 1);
};

// updates the last used time to 'now'
DataGetter.prototype.updateItemTime = function(name) {
  var i = this.indexOfDev(name);
  return this.data.saved_macs[i].lastUse = Date.now();
};

// write data to file
DataGetter.prototype.save = function(cb) {
  if (typeof cb === "function") {
    fs.writeFile(this.filePath, JSON.stringify(this.data), cb);
  } else {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data));
  }
};

module.exports = function(config, home) {
  var conf;
  if (typeof config === "object" && config !== null) {
    conf = config;
  } else {
    conf = defConfig;
  }


  return new DataGetter(conf, home);
};
