var fs = require('fs'),
  path = require('path'),
  Table = require('cli-table'),
  defConfig = require("../config.json"), // default config (may be removed in future)
  pretty = require('pretty-date'),
  optimist = require('optimist'),
  semver = require('semver'),
  util = require("./util.js")(optimist.argv);


// Initialize + load data
function DataGetter(config, hm) {
  this.config = config;

  // Make the path to the db file
  if (hm) {
    var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    this.file = path.join(homeDir, this.config.wakefile);
  } else {
    this.file = this.config.wakefile; // this is used for tests
  }

  if (fs.existsSync(this.file)) {
    // Read and parse the saved file
    try {
      this.data = JSON.parse(fs.readFileSync(this.file));
      this.reparseData();
    } catch (e) {
      console.log(e);
      process.exit(-1);
    }
  } else {
    // Make a new file
    this.data = {
      version: this.config.version,
      saved_macs: []
    };
    fs.writeFileSync(this.file, JSON.stringify(this.data));
  }

  // if the version of the file is less then the version of the program, fix the old format
  if (semver.lt(this.data.version, this.config.version)) {
    this.fixOldFormat();
  }
}

// Fixes any format changes from the last version
DataGetter.prototype.fixOldFormat = function() {
  // fix old format of 'lastUse' field
  for (var i = 0; i < this.data.saved_macs.length; i++) {
    if (this.data.saved_macs[i].lastUse === "never") {
      this.data.saved_macs[i].lastUse = -Infinity;
    }
  }
  this.save();
};

DataGetter.prototype.reparseData = function() {
  for (var i = 0; i < this.data.saved_macs.length; i++) {
    if (this.data.saved_macs[i].lastUse === "never" || this.data.saved_macs[i].lastUse === null) {
      this.data.saved_macs[i].lastUse = -Infinity;
    }
  }
};

// get the list of saved items
DataGetter.prototype.getItems = function() {
  return this.data.saved_macs;
};

// return the element of given name, return false if not found
DataGetter.prototype.getItem = function(device) {
  var list = this.getItems();

  for (var index in list) {
    if (list[index].name == device) {
      return list[index];
    }
  }
  return false;
};

// return the index of device in array
DataGetter.prototype.indexOfDev = function(name) {
  var devices = this.getItems();
  for (var i in devices) {
    if (devices[i].name == name) {
      return i;
    }
  }
  return -1;
};

// does the device exist?
DataGetter.prototype.deviceExists = function(name) {
  if (this.indexOfDev(name) !== -1) {
    return true;
  } else {
    return false;
  }
};

// add device to data list and save
DataGetter.prototype.addItem = function(device) {
  this.data.saved_macs.push(device);
  this.save();
};

// remove device from data list and save
DataGetter.prototype.removeItem = function(name) {
  var i = this.indexOfDev(name);
  this.data.saved_macs.splice(i, 1);
  this.save();
};

// updates the last used time to 'now'
DataGetter.prototype.updateItemTime = function(name) {
  var i = this.indexOfDev(name);
  this.data.saved_macs[i].lastUse = Date.now();
  this.save();
};

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
DataGetter.prototype.save = function() {
  // convert old format
  fs.writeFileSync(this.file, JSON.stringify(this.data));
};

module.exports = function(config, home) {
  var conf;
  var hm;
  if (typeof config === "undefined") {
    conf = defConfig;
  } else {
    conf = config;
  }

  if (typeof home === "undefined") {
    hm = true;
  } else {
    hm = home;
  }


  return new DataGetter(conf, hm);
};