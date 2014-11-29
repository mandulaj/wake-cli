#! /usr/bin/env node

var wol = require('wake_on_lan'),
  optimist = require('optimist').boolean('r'),
  util = require('./util.js')(optimist.argv),
  colors = require('colors'),
  config = require('../config.json'),
  prompt = require('prompt'),
  helpFiles = require('../helpfile.json'),
  dataGetter = require('./dataGetter.js');

var argv = optimist.argv;

if (argv._.length === 0) {
  if (argv.h) {
    printHelp("main");
  } else if (argv.v) {
    console.log("Version: " + config.version);
  } else {
    printGeneralHelp();
  }
  process.exit(0);
}

switch (argv._[0]) {
  /* wake up
  *
  * This command is used to send the magic packet to the device
  * It will try to read the single argument to the up command and parse it
  * If it is a valid MAC the magic packet is send to it
  * Else the wakefile is queried and if a matching saved device is found, its MAC is targeted
  */
  case 'up':
    if (argv.h) {
      printHelp("up");
      process.exit(0);
    }
    var mac;
    // Do we have at least 2 arguments?
    // TODO: this will change to handle a list of files
    if (argv._.length < 2) {
      util.failUp();
    }

    // Get the second argument
    var data = argv._[1];

    // if the argument is in the list of saved, get it...
    var device = dataGetter.getItem(data);
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
    wol.wake(mac, function(error) {
      if (error !== null) {
        console.log(data);
      }
    });
    break;
  /* wake list
  *
  * This command will list all the saved devices located in the wakefile
  * It will print the name, mac and time of last use in the small table
  */
  case 'list':
    dataGetter.listSaved();
    break;
  /* wake add
  *
  * To add a new MAC to the list of saved devices use this command
  * The command will check if the supplied MAC is valid and if the name is free
  * If both test pass the device is saved to the wakefile for future use.
  */
  case 'add':
    if (argv.h) { // user wants help
      printHelp("add");
      process.exit(0);
    }

    if (argv._.length < 3) {
      util.failAdd();
      process.exit(-1);
    }

    // get the name and mac
    var name = argv._[1];
    var mac = argv._[2];

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
      lastUse: "never"
    };

    // save the device
    dataGetter.addItem(device);

    if (argv.r) {
      console.log("  Sending magic packet to ".green + device.name + "[" + util.beautifyMac(device.mac) + "]");
      wol.wake(device.mac, function(error) {
        if (error !== null) {
          console.log(data);
        }
      });
    }
    break;
  /* wake rm
  *
  * When a device is to be removed from the wakefile permanently this command should be used
  * The command will check if the name of deice exists in the wakefile
  * It will then ask the user to confirm the action
  * After the confirmation the device and its MAC address will be removed from the wakefile
  */
  case 'rm':
    if (argv.h) { // user wants help
      printHelp("rm");
      process.exit(0);
    }

    if (argv._.length < 2) {
      util.failRm();
      process.exit(-1);
    }

    var name = argv._[1];

    var item = dataGetter.getItem(name);
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
    break;
  /* wake edit
  *
  * To edit an existing device in the wakefile use this command
  * This command interactively updates the saved values for the selected device
  */
  case "edit":
    if (argv.h) { // user wants help
      printHelp("edit");
      process.exit(0);
    }

    if (argv._.length < 2) {
      util.failEdit();
      process.exit(-1);
    }

    var toEdit = dataGetter.indexOf(argv._[1]);
    if (toEdit == -1) {
      console.log("    Error: ".red + argv._[1] + " is not in the list");
      process.exit(-1);
    } else {
      toEdit = dataGetter.getItem(argv._[1]);
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
    break;
  default:
    printGeneralHelp();
}

// Function that prints a simple usage text when the wake command is used alone
function printGeneralHelp() {
  console.log("  Usage: ".red.bold + argv.$0 + " {up|list|add|rm}");
  console.log("  " + argv.$0.bold + " -h".bold + " for more help");
}

// Prints a formated version of the help data for a selected command
function printHelp(command) {
  var help = helpFiles[command];
  console.log();
  if (command === "main") {
    console.log("---------- " + "Wake command help".bold + " ----------");
  } else {
    console.log("\nHelp file for ".red.bold + command.cyan.bold + ":".cyan.bold);
  }
  console.log(help.description);
  console.log("\nExamples:".bold);
  for (var i in help.examples) {
    console.log("  " + help.examples[i]);
  }
  console.log("\nOptions:".bold);
  for (i in help.options) {
    console.log("  " + help.options[i].name.magenta);
    console.log("    " + help.options[i].description);
  }
}
