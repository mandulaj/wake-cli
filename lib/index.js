var optimist = require('optimist').boolean('r'),
  colors = require('colors'),
  config = require('../config.json'),
  util = require('./util.js')(optimist.argv, config),

  dataGetter = require('./dataGetter.js')(config, process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']);

dataGetter.getDataFromFile(function(err){
  if(err) throw err;
  var commandExec = require("./commandExecuter.js")(optimist.argv, dataGetter, config);
  commandExec.runCommand();
});


