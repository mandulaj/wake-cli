var Table = require('cli-table'),
  pretty = require('pretty-date'),
  util = require("./util.js")(),
  helpFiles = require('../helpfile.json'),
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

  // function for sorting the saved items
  var table = new Table({
    head: ["Name".white.bold, "MAC".white.bold, "Used".white.bold]
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
TermRenderer.prototype.printGeneralHelp = function() {
  console.log("  Usage: ".red.bold + argv.$0 + " {up|list|add|rm|edit}");
  console.log("  " + argv.$0.bold + " -h".bold + " for more help");
}

// Prints a formated version of the help data for a selected command
TermRenderer.prototype.printHelp = function(command) {
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

module.exports = function(dg) {
  return new TermRenderer(dg);
};
