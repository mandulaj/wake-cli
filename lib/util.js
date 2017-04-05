var defConfig = require("../config.json");
var colors = require("colors");
var argv = require("./optimist-setup.js").argv;

function Util(config) {
  this.config = config;
}

// Return message correctly formated
Util.prototype.failUp = function() {
  var msg = "  Usage: ".red.bold + argv.$0 + " up <MAC>||<saved item>\n";
  msg += "  " + argv.$0.bold + " up -h".bold + " for more help";
  return msg;
};

// Return message correctly formated
Util.prototype.failAdd = function() {
  var msg = "  Usage: ".red.bold + argv.$0 + " add <name> <MAC>\n";
  msg += "  " + argv.$0.bold + " add -h".bold + " for more help";
  return msg;
};

// Return message correctly formated
Util.prototype.failRm = function() {
  var msg = "  Usage: ".red.bold + argv.$0 + " rm <name>\n";
  msg += "  " + argv.$0.bold + " rm -h".bold + " for more help";
  return msg;
};

// Return messagecorrectly formated
Util.prototype.failEdit = function() {
  var msg = "  Usage: ".red.bold + argv.$0 + " edit <name>\n";
  msg += "  " + argv.$0.bold + " edit -h".bold + " for more help";
  return msg;
};

// Returns true if `mac` is a valid MAC
Util.prototype.checkMac = function(mac) {
  if(typeof mac === 'undefined' || !mac){
    return false;
  }
  if (mac.length == 17) {
    return new RegExp("([a-fA-f0-9]{2}" + this.config.delimiter + "){5}[a-fA-f0-9]{2}").test(mac);
  }
  if (mac.length != 12 || mac.match(/[^a-fA-F0-9]/)) {
    return false;
  }
  return true;
};

// return the mac in form 'XX:XX:XX:XX:XX:XX'
Util.prototype.beautifyMac = function(mac) {
  if (!this.checkMac(mac)) {
    return false;
  }
  if (mac.length === 17) {
    return mac.toUpperCase();
  }
  var newMac = [];
  for (var i = 0; i < mac.length; i += 2) {
    newMac.push(mac.slice(i, i + 2));
  }
  return newMac.join(this.config.delimiter).toUpperCase();
};

// return the mac in form 'xxxxxxxxxxxx'
Util.prototype.uglifyMac = function(mac) {
  if (!this.checkMac(mac)) {
    return false;
  }
  mac = mac.toString().toUpperCase();
  if (mac.length == 17) {
    mac = mac.replace(new RegExp(mac[2], 'g'), '');
  }
  return mac;
};

// Remove color from colored strings
Util.prototype.decolorize = function(str) {
  return str.replace(/\u001b\[\d+m/g, "");
};

/* istanbul ignore next */
Util.prototype.stdOut = function(data) {
  if (!argv.color) {
    data = this.decolorize(data);
  }
  process.stdout.write(data + "\n");
};

module.exports = function(config) {
  var conf;
  if (typeof config === "undefined") {
    conf = defConfig;
  } else {
    conf = config;
  }

  return new Util(conf);
};
