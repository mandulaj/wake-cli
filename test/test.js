var expect = require("expect.js");
var config = require("../config.json"); // the real config

function clone(obj) {
  if (obj === null || typeof obj !== 'object')
    return obj;

  var temp = obj.constructor();

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      temp[key] = clone(obj[key]);
    }
  }
  return temp;
}

// TODO: add more tests!

describe("DataGetter", function() {
  describe("#init", function() {
    var conf = clone(config);
    conf.wakefile = "./test/testWakefiles/wakefile1.json";
    var dg = require("../lib/dataGetter.js")(conf, false);

    it("should return and object", function() {
      expect(dg).to.be.an('object');
      expect(dg.file).to.be.a('string');
      expect(dg.data).to.be.an('object');
    });
    it('should override the default path', function() {
      expect(dg.file).to.be("./test/testWakefiles/wakefile1.json");
    });
    it('should set the path to be based in the home directory', function() {
      // TODO: test for the correct homedir concat
    });
  });
});