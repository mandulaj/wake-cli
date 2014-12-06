var prompt = require('prompt');

function CommandExecuter(argv) {
  this.argv = argv;
}

CommandExecuter.prototype.handleUp = function() {
  if (this.argv.h) {
    printHelp("up");
    process.exit(0);
  }

  var mac;
  // Do we have at least 2 arguments?
  if (this.argv._.length < 2) {
    util.failUp();
  }

  for (var i = 1; i < this.argv._.length; i++) {
    // get the next device to wake up
    var data = this.argv._[i];
    // if the argument is in the list of saved, get it...
    var device = dataGetter.getItemByName(data);
    if (!device) { // If not...
      if (!util.checkMac(data)) { // Is it even a mac?
        util.failUp();
      } else {
        mac = data;
        console.log("  Sending magic packet to ".green + mac);
      }
    } else {
      console.log("  Sending magic packet to ".green + device.name + "[" + util.beautifyMac(device.mac) + "]");
      dataGetter.updateItemTime(device.name);
      mac = device.mac;
    }

    // OK we have the mac so send the packet
    wol.wake(mac, this._wakeCheckError);
  }
};

CommandExecuter.prototype._wakeCheckError = function(error) {
  if (error !== null) {
    console.log(error, data);
  }
};

CommandExecuter.prototype.handleList = function() {
  var sort = "name";
  var reverse = false;
  if (this.argv.h) { // user wants help
    printHelp("list");
    process.exit(0);
  }

  if (this.argv.s) {
    if (typeof this.argv.s !== "string") {
      console.log("  Invalid sort name".red);
      process.exit(-1);
    }
    switch (this.argv.s.toLowerCase()) {
      case "name":
        sort = "name";
        break;
      case "mac":
        sort = "mac";
        break;
      case "used":
        sort = "lastUse";
        reverse = true;
        break;
      default:
        sort = "name";
    }
  }

  if (this.argv.r) {
    reverse = !(reverse);
  }

  dataGetter.listSaved(sort, reverse);
};

CommandExecuter.prototype.handleAdd = function() {
  if (this.argv.h) { // user wants help
    printHelp("add");
    process.exit(0);
  }

  if (this.argv._.length < 3) {
    util.failAdd();
    process.exit(-1);
  }

  // get the name and mac
  var name = this.argv._[1];
  var mac = this.argv._[2];

  // is the MAC valid?
  if (!util.checkMac(mac.toString())) {
    console.log("  Error: ".red + "Invalid MAC");
    process.exit(-1);
  }
  // check if the name is free
  if (dataGetter.deviceExists(name)) {
    console.log("  Error: ".red + "device '" + name + "' already exists!");
    process.exit(-1);
  }

  // use the uglifyed version for storage
  mac = util.uglifyMac(mac);

  // construct the object
  var device = {
    name: name,
    mac: mac,
    created: Date.now(),
    lastUse: Infinity
  };

  // save the device
  dataGetter.addItem(device);

  if (this.argv.r) {
    console.log("  Sending magic packet to ".green + device.name + "[" + util.beautifyMac(device.mac) + "]");
    wol.wake(device.mac, function(error) {
      if (error !== null) {
        console.log(data);
      }
    });
  }
};

CommandExecuter.prototype.handleRm = function() {
  if (this.argv.h) { // user wants help
    printHelp("rm");
    process.exit(0);
  }

  if (this.argv._.length < 2) {
    util.failRm();
    process.exit(-1);
  }

  var name = this.argv._[1];

  var item = dataGetter.getItemByName(name);
  if (item) { // does the item exist
    var schema = {
      properties: {
        confirm: {
          description: "Are you sure? [y/n]",
          type: 'string',
          pattern: "^[yn]",
          message: "Only type 'y' or 'n'",
          required: true
        }
      }
    };
    console.log("  Warning! ".yellow.bold + "You are about to remove " + item.name.cyan + " with MAC " + util.beautifyMac(item.mac).underline);
    prompt.message = ""; // remove the ugly messages and propts
    prompt.delimiter = "";
    prompt.start();

    prompt.get(schema, function(err, data) {
      if (err) {
        throw err;
      }
      if (data.confirm == "y") {
        dataGetter.removeItem(name);
      } else {
        process.exit(0);
      }
    });

  } else {
    console.log("   Error: ".red + "device '" + name + "' does not exist");
  }
};

CommandExecuter.prototype.handleEdit = function() {
  if (this.argv.h) { // user wants help
    printHelp("edit");
    process.exit(0);
  }

  if (this.argv._.length < 2) {
    util.failEdit();
    process.exit(-1);
  }

  var toEdit = dataGetter.indexOfDev(this.argv._[1]);
  if (toEdit == -1) {
    console.log("    Error: ".red + this.argv._[1] + " is not in the list");
    process.exit(-1);
  } else {
    toEdit = dataGetter.getItemByName(this.argv._[1]);
  }

  var schema = {
    properties: {
      name: {
        description: "New name",
        type: 'string',
        pattern: "^[yn]",
        message: "Only type 'y' or 'n'",
        required: true
      }
    }
  };
  // TODO: implement the interactive edit
};
