var prompt = require('prompt'),
  wol = require('wake_on_lan'),
  colors = require('colors');

function CommandExecuter(argv, dg, config) {
  this.util = require('./util.js')(argv, config);
  this.argv = argv;
  this.dg = dg;
  this.output = require("./termRender.js")(dg);
}

CommandExecuter.prototype._handleUp = function(cb) {

  var mac;
  // Do we have at least 2 arguments?
  if (this.argv._.length < 2) {
    this.util.failUp(function(msg) {
      return cb(new Error(msg));
    });
  }

  function __checkError(err) {
    if (err !== null) {
      if (err instanceof Error) {
        console.log(error);
        return cb(err); //TODO: check if this works
      } else if (typeof err === "string") {
        return cb(new Error(err));
      }
    }
  }

  for (var i = 1; i < this.argv._.length; i++) {
    // get the next device to wake up
    var data = this.argv._[i];
    // if the argument is in the list of saved, get it...
    var device = this.dg.getItemByName(data);
    if (!device) { // If not...
      if (!this.util.checkMac(data)) { // Is it even a mac?
        this.util.failUp(__checkError);
      } else {
        mac = data;
        console.log("  Sending magic packet to ".green + mac);
      }
    } else {
      console.log("  Sending magic packet to ".green + device.name + "[" + this.util.beautifyMac(device.mac) + "]");
      this.dg.updateItemTime(device.name);
      mac = device.mac;
    }

    // OK we have the mac so send the packet
    wol.wake(mac, __checkError);
  }
};

CommandExecuter.prototype._handleList = function(cb) {
  var sort = "name";
  var reverse = false;

  if (this.argv.s) {
    if (typeof this.argv.s !== "string") {
      // TODO: check for the name is a list of names
      return cb(new Error("Invalid sort name"));
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

  this.output.renderList(sort, reverse);
  return 0;
};

CommandExecuter.prototype._handleAdd = function(cb) {

  if (this.argv._.length < 3) {
    this.util.failAdd();
    return -1;
  }

  // get the name and mac
  var name = this.argv._[1];
  var mac = this.argv._[2];

  // is the MAC valid?
  if (!this.util.checkMac(mac.toString())) {
    console.log("  Error: ".red + "Invalid MAC");
    return -1;
  }
  // check if the name is free
  if (this.dg.deviceExists(name)) {
    console.log("  Error: ".red + "device '" + name + "' already exists!");
    return -1;
  }

  // use the uglifyed version for storage
  mac = this.util.uglifyMac(mac);

  // construct the object
  var device = {
    name: name,
    mac: mac,
    created: Date.now(),
    lastUse: Infinity
  };

  // save the device
  this.dg.addItem(device);

  if (this.argv.r) {
    console.log("  Sending magic packet to ".green + device.name + "[" + this.util.beautifyMac(device.mac) + "]");
    wol.wake(device.mac, function(error) {
      if (error !== null) {
        console.log(data);
      }
    });
  }
  return 0;
};

CommandExecuter.prototype._handleRm = function(cb) {

  if (this.argv._.length < 2) {
    this.util.failRm();
    return -1;
  }

  var name = this.argv._[1];

  var item = this.dg.getItemByName(name);
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
    console.log("  Warning! ".yellow.bold + "You are about to remove " + item.name.cyan + " with MAC " + this.util.beautifyMac(item.mac).underline);
    prompt.message = ""; // remove the ugly messages and propts
    prompt.delimiter = "";
    prompt.start();

    prompt.get(schema, function(err, data) {
      if (err) {
        throw err;
      }
      if (data.confirm == "y") {
        this.dg.removeItem(name);
      } else {
        return 0;
      }
    });

  } else {
    console.log("   Error: ".red + "device '" + name + "' does not exist");
  }
};

CommandExecuter.prototype._handleEdit = function(cb) {

  if (this.argv._.length < 2) {
    this.util.failEdit();
    return -1;
  }

  var toEdit = this.dg.indexOfDev(this.argv._[1]);
  if (toEdit == -1) {
    console.log("    Error: ".red + this.argv._[1] + " is not in the list");
    process.exit(-1);
  } else {
    toEdit = this.dg.getItemByName(this.argv._[1]);
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
  return 0;
};

CommandExecuter.prototype.runCommand = function(cb) {

  // No command supplied
  if (this.argv._.length <= 0) {
    // User asked for the main help
    if (this.argv.h) {
      this.output.printHelp("main");
      // User asked for version
    } else if (this.argv.v) {
      this.output.version(config.version);
    } else {
      // User just wrote the command, give him a general help
      this.output.printGeneralHelp();
    }
    return cb(null); // Noting left to do, exit
  }

  // The user did supply a command yet wants help
  if (this.argv.h) {
    this.output.printHelp(this.argv._[0]);
    return cb(null);
  }

  // Switch between the commands
  switch (this.argv._[0]) {
    /* wake up
     *
     * This command is used to send the magic packet to the device
     * It will try to read the single argument to the up command and parse it
     * If it is a valid MAC the magic packet is send to it
     * Else the wakefile is queried and if a matching saved device is found, its MAC is targeted
     */
    case 'up':
      return this._handleUp(cb);

      /* wake list
       *
       * This command will list all the saved devices located in the wakefile
       * It will print the name, mac and time of last use in the small table
       */
    case 'list':
      return this._handleList(cb);

      /* wake add
       *
       * To add a new MAC to the list of saved devices use this command
       * The command will check if the supplied MAC is valid and if the name is free
       * If both test pass the device is saved to the wakefile for future use.
       */
    case 'add':
      return this._handleAdd(cb);

      /* wake rm
       *
       * When a device is to be removed from the wakefile permanently this command should be used
       * The command will check if the name of deice exists in the wakefile
       * It will then ask the user to confirm the action
       * After the confirmation the device and its MAC address will be removed from the wakefile
       */
    case 'rm':
      return this._handleRm(cb);

      /* wake edit
       *
       * To edit an existing device in the wakefile use this command
       * This command interactively updates the saved values for the selected device
       */
    case "edit":
      return this._handleEdit(cb);

    default:
      this.output.printGeneralHelp();
  }
  return cb(0);
};


module.exports = function(argv, dg, config) {
  return new CommandExecuter(argv, dg, config);
};