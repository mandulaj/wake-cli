var minimist = require("minimist")(process.argv.slice(2), {
  default: {'r': false, 'c': 120, 's': "name"},
  boolean: ['r']
}),
  colors = require('colors'),
  config = require('../config.json'),
  dataGetter = require('./dataGetter.js')(config, process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']);

dataGetter.getDataFromFile(function(err) {
  if (err) throw err;

  // Run command
  var commandExec = require("./commandExecuter.js")(minimist, dataGetter, config);
  commandExec.runCommand(function(err) {
    if (err) {
      console.log(err.message);
      process.exit(-1);
    }
    process.exit(0);
  });
});
