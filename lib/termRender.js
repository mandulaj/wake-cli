var Table = require('cli-table'),
  pretty = require('pretty-date'),
  helpFiles = require('../helpfile.json'),
  config = require('../config.json'),
  util = require("./util.js")(config),
  colors = require('colors');

function TermRenderer(dataGetter) {
  this.dg = dataGetter;
}

TermRenderer.prototype.cloneArray = function(array) {
  var ret = [];
  for (var i in array) {
    ret[i] = array[i];
  }
  return ret;
};

TermRenderer.prototype.sortList = function(sort, reverse, list) {
  list = this.cloneArray(list);

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

  list.sort(compare);
  return list;
};

// print a table populated with all saved devices
TermRenderer.prototype.renderList = function(sort, reverse) {
  var saved = this.sortList(sort, reverse, this.dg.getItems());

  // Flip it again
  if(sort === 'lastUse'){
    reverse = !(reverse);
  }

  var triangel = " \u25BC".white.bold;
  if (reverse) {
    triangel = " \u25B2".white.bold
  }


  // function for sorting the saved items
  var table = new Table({
    head: ["Name".white.bold + (sort==="name"?triangel:""),
           "MAC".white.bold + (sort==="mac"?triangel:""),
           "Used".white.bold + (sort==="lastUse"?triangel:"")]
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

  return table.toString();
};

// Function that prints a simple usage text when the wake command is used alone
TermRenderer.prototype.renderGeneralHelp = function() {
  var message = "";
  message += "  Usage: ".red.bold + "wake {up|list|add|rm|edit}\n";
  message += "  wake -h".bold + " for more help";
  return message;
};

// Prints a formated version of the help data for a selected command
TermRenderer.prototype.renderHelp = function(command) {
  command = command.toString();
  var commands = ['main', 'up', 'add', 'list', 'edit', 'rm'];
  if (commands.indexOf(command) === -1) {
    return "Command '".red.bold + command.red.bold.underline + "' does not exist!".red.bold;
  }
  var message = "";
  var help = helpFiles[command];
  if (command === "main") {
    message += "---------- " + "Wake command help".bold + " ----------\n";
  } else {
    message += "\nHelp file for ".bold + command.cyan.bold + ":".cyan.bold + "\n";
  }
  message += help.description + "\n";
  message += "\nExamples:".bold + "\n";
  for (var i in help.examples) {
    message += "  " + help.examples[i] + "\n";
  }
  message += "\nOptions:".bold + "\n";
  for (i in help.options) {
    message += "  " + help.options[i].name.magenta + "\n";
    message += "    " + help.options[i].description + "\n";
  }
  return message;
};

/* istanbul ignore next */
TermRenderer.prototype.printList = function(sort, reverse) {
  this.stdOut(this.renderList(sort, reverse));
};

/* istanbul ignore next */
TermRenderer.prototype.printGeneralHelp = function() {
  this.stdOut(this.renderGeneralHelp());
};

/* istanbul ignore next */
TermRenderer.prototype.printHelp = function(command) {
  this.stdOut(this.renderHelp(command));
};

/* istanbul ignore next */
TermRenderer.prototype.version = function(version) {
  this.stdOut("Version: ".bold + version.toString().cyan.bold);
};

/* istanbul ignore next */
TermRenderer.prototype.stdOut = function(data) {
  util.stdOut(data);
};

module.exports = function(dg) {
  return new TermRenderer(dg);
};
