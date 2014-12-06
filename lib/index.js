var optimist = require('optimist').boolean('r'),
  colors = require('colors'),
  config = require('../config.json'),
  helpFiles = require('../helpfile.json'),
  util = require('./util.js')(optimist.argv, config),

  dataGetter = require('./dataGetter.js')(config, process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']),

dataGetter.getDataFromFile(function(err){
  if(err) throw err;
  var commandExec = require("./commandExecuter.js")(optimist.argv, dataGetter, config);

});

// Switch between the commands
switch (argv._[0]) {
  /* wake up
   *
   * This command is used to send the magic packet to the device
   * It will try to read the single argument to the up command and parse it
   * If it is a valid MAC the magic packet is send to it
   * Else the wakefile is queried and if a matching saved device is found, its MAC is targeted
   */
  case 'up':
    command.handleUp(argv);
    break;

    /* wake list
     *
     * This command will list all the saved devices located in the wakefile
     * It will print the name, mac and time of last use in the small table
     */
  case 'list':
    command.handleList(argv);
    break;
    /* wake add
     *
     * To add a new MAC to the list of saved devices use this command
     * The command will check if the supplied MAC is valid and if the name is free
     * If both test pass the device is saved to the wakefile for future use.
     */
  case 'add':
    command.handleAdd(argv);
    break;
    /* wake rm
     *
     * When a device is to be removed from the wakefile permanently this command should be used
     * The command will check if the name of deice exists in the wakefile
     * It will then ask the user to confirm the action
     * After the confirmation the device and its MAC address will be removed from the wakefile
     */
  case 'rm':
    command.handleRm(argv);
    break;
    /* wake edit
     *
     * To edit an existing device in the wakefile use this command
     * This command interactively updates the saved values for the selected device
     */
  case "edit":
    command.handleEdit(argv);
    break;
  default:
    printGeneralHelp();
}

// Function that prints a simple usage text when the wake command is used alone
function printGeneralHelp() {
  console.log("  Usage: ".red.bold + argv.$0 + " {up|list|add|rm|edit}");
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
