var optimist = require('optimist')
  .boolean('r')
  .default('color', true);


module.exports = optimist;