var Table = require('cli-table'),
  pretty = require('pretty-date'),
  colors = require('colors');

function TermDrawer(){

}

// print a table populated with all saved devices
TermDrawer.prototype.listSaved = function(sort, reverse) {
  var saved = this.getItems();
  // function for sorting the saved items
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

  saved.sort(compare);

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
  console.log(table.toString());
};

module.exports = function() {
  return TermDrawer;
}
