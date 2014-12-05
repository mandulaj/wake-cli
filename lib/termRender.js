var Table = require('cli-table'),
  pretty = require('pretty-date'),
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
  var saved = this.sortList(sort, reverse, this.getItems());

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
  console.log(table.toString());
};

module.exports = function() {
  return TermDrawer;
};