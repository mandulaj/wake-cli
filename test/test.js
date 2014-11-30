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

describe("Helper Functions", function() {
  describe("DataGetter", function() {
    var conf = clone(config);
    conf.wakefile = "./test/testWakefiles/wakefile1.json";
    var dg = require("../lib/dataGetter.js")(conf, false);
    describe("#init", function() {
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
      it('should have all functions', function() {
        expect(dg.fixOldFormat).to.be.a("function");
        expect(dg.reparseData).to.be.a("function");
        expect(dg.getItems).to.be.a("function");
        expect(dg.getItem).to.be.a("function");
        expect(dg.indexOfDev).to.be.a("function");
        expect(dg.deviceExists).to.be.a("function");
        expect(dg.addItem).to.be.a("function");
        expect(dg.removeItem).to.be.a("function");
        expect(dg.updateItemTime).to.be.a("function");
        expect(dg.listSaved).to.be.a("function");
        expect(dg.save).to.be.a("function");
      });
    });
    describe("#getItems", function() {
      var macs = dg.getItems();
      it("should return and array", function() {
        expect(macs).to.be.an("array");
        expect(macs).to.have.length(0);
      });
    });
    describe("#getItem", function() {

    });
  });

  describe("Util", function() {

  });
});