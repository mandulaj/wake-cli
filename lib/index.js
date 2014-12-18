var optimist = require("./optimist-setup.js"),
  colors = require('colors'),
  config = require('../config.json'),
  util = require('./util.js')(config),
  dataGetter = require('./dataGetter.js')(config, process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']);

dataGetter.getDataFromFile(function(err) {
  if (err) throw err;
  var commandExec = require("./commandExecuter.js")(optimist.argv, dataGetter, config);
  commandExec.runCommand(function(err) {
    if (err) {
      console.log(err.message);
      process.exit(-1);
    }
    process.exit(0);
  });
});