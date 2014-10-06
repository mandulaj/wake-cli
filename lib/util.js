var config = require("../config.json");

function Util(argv) {
  this.argv = argv;
}

// Returns true if `mac` is a valid MAC
Util.prototype.checkMac = function(mac) {
  if (mac.length == 17) {
    mac = mac.replace(new RegExp(mac[2], 'g'), '');
  }
  if (mac.length != 12 || mac.match(/[^a-fA-F0-9]/)) {
    return false;
  }
  return true;
};

// Print fail and exit
Util.prototype.failUp = function() {
  console.log("  Usage: ".red.bold + this.argv.$0 + " up <MAC>||<saved item>");
  console.log("  " + this.argv.$0.bold + " up -h".bold + " for more help");
  process.exit(-1);
};

// Print fail and exit
Util.prototype.failAdd = function() {
  console.log("  Usage: ".red.bold + this.argv.$0 + " add <name> <MAC>");
  console.log("  " + this.argv.$0.bold + " add -h".bold + " for more help");
  process.exit(-1);
};

// Print fail and exit
Util.prototype.failRm = function() {
  console.log("  Usage: ".red.bold + this.argv.$0 + " rm <name>");
  console.log("  " + this.argv.$0.bold + " rm -h".bold + " for more help");
  process.exit(-1);
};

// Print fail and exit
Util.prototype.failEdit = function() {
  console.log("  Usage: ".red.bold + this.argv.$0 + " edit <name>");
  console.log("  " + this.argv.$0.bold + " edit -h".bold + " for more help");
  process.exit(-1);
};

// return the mac in form 'xx:xx:xx:xx:xx:xx'
Util.prototype.beautifyMac = function(mac) {
  var newMac = [];
  for (var i = 0; i < mac.length; i += 2) {
    newMac.push(mac.slice(i, i + 2));
  }
  return newMac.join(config.delimiter);
};

// return the mac in form 'xxxxxxxxxxxx'
Util.prototype.uglifyMac = function(mac) {
  mac = mac.toString();
  if (mac.length == 17) {
    mac = mac.replace(new RegExp(mac[2], 'g'), '');
  }
  return mac;
};

module.exports = function(argv) {
  return new Util(argv);
};
