var fs = require('fs'),
  Table = require('cli-table'),
  defConfig = require("../config.json"), // default config (may be removed in future)
  pretty = require('pretty-date'),
  optimist = require('optimist'),
  semver = require('semver'),
  util = require("./util.js")(optimist.argv);


// Initialize + load data
function DataGetter(config, hm) {
  this.config = config;
  this.fielPath = "";
  this.data = {};

  // Make the path to the db file
  if (hm) {
    this.filePath = util.buildPath(hm); // in case we want to use another base path
  } else {
    this.filePath = util.buildPath(); // use the default (HOME DIR) base path
  }
  // test if the file exists
}

// get data from the file. make a new file in case the file does not exit yet
DataGetter.prototype.getDataFromFile = function(){
  var data = {};
  if (fs.existsSync(this.filePath)) {
    // Read and parse the saved file
    try {
      data = JSON.parse(fs.readFileSync(this.filePath));
      this.reparseData(data);
    } catch (e) {
      console.log(e);
      process.exit(-1);
      // TODO: quit the program in a more general way
    }
  } else {
    // Make a new file
    this.data = this.makeNewData();
  }
  // if the version of the file is less then the version of the program, fix the old format
  if (semver.lt(data.version, this.config.version)) {
    data = this.fixOldFormat(data);
    this.data = data;
  }
};

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
  return data;
};

DataGetter.prototype.reparseData = function(data) {
  var lastUse = null;
  for (var i = 0; i < data.saved_macs.length; i++) {
    lastUse = data.saved_macs[i].lastUse;
    if (lastUse === "never" || lastUse === null) {
      data.saved_macs[i].lastUse = -Infinity;
    }
  }
  return data;
};


// get the list of saved items
DataGetter.prototype.getItems = function() {
  return this.data.saved_macs;
};

// return the element of given name, return false if not found
DataGetter.prototype.getItemByName = function(name) {
  var list = this.getItems();

  for (var index in list) {
    if (list[index].name == name) {
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
};

// remove device from data list and save
DataGetter.prototype.removeItem = function(name) {
  var i = this.indexOfDev(name);
  this.data.saved_macs.splice(i, 1);
};

// updates the last used time to 'now'
DataGetter.prototype.updateItemTime = function(name) {
  var i = this.indexOfDev(name);
  this.data.saved_macs[i].lastUse = Date.now();
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
DataGetter.prototype.save = function(cb) {
  // convert old format
  if (typeof cb === "function") {
    fs.writeFile(this.filePath, JSON.stringify(this.data), cbc);
  } else {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data));
  }
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
    hm = undefined;
  } else {
    hm = home;
  }

  return new DataGetter(conf, hm);
};
