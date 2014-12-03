var defConfig = require("../config.json");
var colors = require("colors");

function Util(argv, config) {
  this.argv = argv;
  this.config = config;
}

// Return message in cb correctly formated
Util.prototype.failUp = function(cb) {
  var msg = "  Usage: ".red.bold + this.argv.$0 + " up <MAC>||<saved item>\n";
  msg += "  " + this.argv.$0.bold + " up -h".bold + " for more help";
  cb(msg);
};

// Return message in cb correctly formated
Util.prototype.failAdd = function(cb) {
  var msg = "  Usage: ".red.bold + this.argv.$0 + " add <name> <MAC>\n";
  msg += "  " + this.argv.$0.bold + " add -h".bold + " for more help";
  cb(msg);
};

// Return message in cb correctly formated
Util.prototype.failRm = function(cb) {
  var msg = "  Usage: ".red.bold + this.argv.$0 + " rm <name>\n";
  msg += "  " + this.argv.$0.bold + " rm -h".bold + " for more help";
  cb(msg);
};

// Return message in cb correctly formated
Util.prototype.failEdit = function(cb) {
  var msg = "  Usage: ".red.bold + this.argv.$0 + " edit <name>\n";
  msg += "  " + this.argv.$0.bold + " edit -h".bold + " for more help";
  cb(msg);
};

// Returns true if `mac` is a valid MAC
Util.prototype.checkMac = function(mac) {
  if (mac.length == 17) {
    return new RegExp("([a-fA-f0-9]{2}" + this.config.delimiter + "){5}[a-fA-f0-9]{2}").test(mac);
  }
  if (mac.length != 12 || mac.match(/[^a-fA-F0-9]/)) {
    return false;
  }
  return true;
};

// return the mac in form 'xx:xx:xx:xx:xx:xx'
Util.prototype.beautifyMac = function(mac) {
  if (!this.checkMac(mac)) {
    return false;
  }
  if (mac.length === 17) {
    return mac;
  }
  var newMac = [];
  for (var i = 0; i < mac.length; i += 2) {
    newMac.push(mac.slice(i, i + 2));
  }
  return newMac.join(this.config.delimiter);
};

// return the mac in form 'xxxxxxxxxxxx'
Util.prototype.uglifyMac = function(mac) {
  if (!this.checkMac(mac)) {
    return false;
  }
  mac = mac.toString();
  if (mac.length == 17) {
    mac = mac.replace(new RegExp(mac[2], 'g'), '');
  }
  return mac;
};

module.exports = function(argv, config) {
  var conf;
  if (typeof config === "undefined") {
    conf = defConfig;
  } else {
    conf = config;
  }

  return new Util(argv, conf);
};
