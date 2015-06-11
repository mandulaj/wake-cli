var prompt = require('prompt'),
  wol = require('wake_on_lan'),
  colors = require('colors');

function CommandExecuter(argv, dg, config) {
  this.util = require('./util.js')(config);
  this.config = config;
  this.argv = argv;
  this.dg = dg;
  this.output = require("./termRender.js")(dg);
}

CommandExecuter.prototype._handleUp = function(cb) {

  var mac;
  // Do we have at least 2 arguments?
  if (this.argv._.length < 2) {
    return cb(new Error(this.util.failUp()));
  }

  function __checkError(err) {
    if (err !== null) {
      if (err instanceof Error) {
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
    var successout;
    if (device === -1) { // If not...
      if (!this.util.checkMac(data)) { // Is it even a mac?
        return cb(new Error("  Wrong MAC format: ".red.bold + data));
      } else {
        mac = data;
        successout = "  Sending magic packet to ".green + mac;
      }
    } else {
      successout = "  Sending magic packet to ".green + device.name + "[" + this.util.beautifyMac(device.mac) + "]";
      this.dg.updateItemTime(device.name);
      this.dg.save();
      mac = device.mac;
    }

    // OK we have the mac so send the packet
    if(this.argv.hasOwnProperty('c')){
      //seconds to milliseconds
      var delay = parseInt(this.argv['c']);

      //default 2 minutes
      if(delay < 1) delay = 120;

      var count = 0;
      var thatoutput = this.output;

      //function to repeat
      function doNextWake()
      {
        thatoutput.stdOut(successout+" #"+ ++count);
        wol.wake(mac, __checkError);
        setTimeout(doNextWake,delay * 1000)
      }


      //start first time
      doNextWake();


    }else{
      //send just once
      this.output.stdOut(successout);
      wol.wake(mac, __checkError);
    }
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

  this.output.printList(sort, reverse);
  return cb(null);
};

CommandExecuter.prototype._handleAdd = function(cb) {
  var self = this;
  if (this.argv._.length < 3) {
    return cb(new Error(this.util.failAdd()));
  }

  // get the name and mac
  var name = this.argv._[1];
  var mac = this.argv._[2];

  // is the MAC valid?
  if (!this.util.checkMac(mac.toString())) {
    return cb(new Error("  Error: ".red + "Invalid MAC"));
  }
  // check if the name is free
  if (this.dg.deviceExists(name)) {
    return cb(new Error("  Error: ".red + "device '" + name + "' already exists!"));
  }

  // use the uglifyed version for storage
  mac = this.util.uglifyMac(mac);

  // construct the object
  var device = {
    name: name,
    mac: mac,
    created: Date.now(),
    lastUse: -Infinity
  };

  // save the device
  this.dg.addItem(device);
  this.dg.save(function(err) {
    if (err) {
      return cb(err);
    }
    if (self.argv.r) {
      this.output.stdOut("  Sending magic packet to ".green + device.name + "[" + self.util.beautifyMac(device.mac) + "]");
      wol.wake(device.mac, function(err) {
        return cb(err);
      });
    } else {
      return cb(null);
    }
  });
};

CommandExecuter.prototype._handleRm = function(cb) {
  var self = this;
  if (this.argv._.length < 2) {
    return cb(new Error(this.util.failRm()));
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
    this.output.stdOut("  Warning! ".yellow.bold + "You are about to remove " + item.name.cyan + " with MAC " + this.util.beautifyMac(item.mac).underline);
    prompt.message = ""; // remove the ugly messages and propts
    prompt.delimiter = "";
    prompt.start();

    prompt.get(schema, function(err, data) {
      if (err) {
        throw err;
      }
      if (data.confirm == "y") {
        self.dg.removeItem(name);
        self.dg.save();
      } else {
        return cb(null);
      }
    });

  } else {
    return cb(new Error("   Error: ".red + "device '" + name + "' does not exist"));
  }
};

CommandExecuter.prototype._handleEdit = function(cb) {

  if (this.argv._.length < 2) {
    return cb(new Error(this.util.failEdit()));
  }

  var toEdit = this.dg.indexOfDev(this.argv._[1]);
  if (toEdit == -1) {
    return cb(new Error("    Error: ".red + this.argv._[1] + " is not in the list"));
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
  return cb(null);
};

CommandExecuter.prototype.runCommand = function(cb) {

  // No command supplied
  if (this.argv._.length <= 0) {
    // User asked for the main help
    if (this.argv.h) {
      this.output.printHelp("main");
      // User asked for version
    } else if (this.argv.v) {
      this.output.version(this.config.version);
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
