// Object for getting ad writing data to and from the file

var fs = require('fs'),
  Table = require('cli-table'),
  defConfig = require("../config.json"), // default config (may be removed in future)
  pretty = require('pretty-date'),
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
DataGetter.prototype.getDataFromFile = function(){
  var data = {};
  if (fs.existsSync(this.filePath)) {
    // Read and parse the saved file
    data = this.parseFileData(fs.readFileSync(this.filePath));
    if (!data) {
      process.exit(-1);
    }
  } else {
    // Make a new file
    data = this.makeNewData();
  }
  // if the version of the file is less then the version of the program, fix the old format
  // TODO: Check if we are not using an older version of program
  if (semver.lt(data.version, this.config.version)) {
    data = this.fixOldFormat(data);
  }
  this.data = data;
};

DataGetter.prototype.parseFileData = function(data){
  try {
    data = JSON.parse(data);
    data = this.serialize(data);
  } catch (e) {
    console.log(e);
    return null;
    // TODO: quit the program in a more general way
  }
  return data;
};

// Return new initialized data object
DataGetter.prototype.makeNewData = function(initialData) {
  var data = {
    version: this.config.version,
    saved_macs: []
  };
  if (typeof initialData === "object") {
    data = initialData
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
    if (wlastUse === null) {
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
  return false;
};

// Return the index of device in array
DataGetter.prototype.indexOfDev = function(name) {
  var devices = this.getItems();
  for (var i in devices) {
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

// TODO: move to displayer
// print a table populated with all saved devices
DataGetter.prototype.listSaved = function(sort, reverse) {
  var saved = this.getItems();
  // function for sorting the saved items
  function compare(a, b) {
    var ret = 0;
    if (a[sort] < b[sort])
      ret = -1;
    if (a[sort] > b[sort])
      ret = 1;

    if (reverse) {
      ret *= -1;
    }
    return ret;
  }

  saved.sort(compare);

  var table = new Table({
    head: ["Name".white.bold, "MAC".white.bold, "Used".white.bold]
  });
  var lastUsed;
  for (var i in saved) {
    if (saved[i].lastUse == -Infinity) {
      lastUsed = "never";
    } else {
      lastUsed = pretty.format(new Date(saved[i].lastUse));
    }
    table.push([saved[i].name.green, util.beautifyMac(saved[i].mac).cyan, lastUsed.yellow]);
  }
  console.log(table.toString());
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
  if (typeof config === "undefined") {
    conf = defConfig;
  } else {
    conf = config;
  }

  return new DataGetter(conf, home);
};
