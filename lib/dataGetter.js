var fs = require('fs'),
  path = require('path'),
  Table = require('cli-table'),
  config = require("../config.json"),
  pretty = require('pretty-date'),
  optimist = require('optimist'),
  util = require("./util.js")(optimist.argv);


// Initialize + load data
function DataGetter() {

  // Make the path to the db file
  var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  this.file = path.join(homeDir, config.wakefile);

  if (fs.existsSync(this.file)) {
    // read and parse the saved file
    try {
      this.data = JSON.parse(fs.readFileSync(this.file));
    } catch (e) {
      console.log(e);
      process.exit(-1);
    }
  } else {
    // make a new file
    this.data = {
      version: config.version,
      saved_macs: []
    };
    fs.writeFileSync(this.file, JSON.stringify(this.data));
  }
}

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
DataGetter.prototype.listSaved = function() {
  var saved = this.getItems();
  var table = new Table({
    head: ["Name".white.bold, "MAC".white.bold, "Last Used".white.bold]
  });
  var lastUsed;
  for (var i in saved) {
    if (saved[i].lastUse == "never") {
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
  fs.writeFileSync(this.file, JSON.stringify(this.data));
};

module.exports = new DataGetter();
