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
    var dg = require("../lib/dataGetter.js")(conf, ".");
    dg.getDataFromFile();
    describe("#init", function() {
      it("should return and object", function() {
        expect(dg).to.be.an('object');
        expect(dg.filePath).to.be.a('string');
        expect(dg.data).to.be.an('object');
      });
      it('should override the default path', function() {
        expect(dg.filePath).to.be("test/testWakefiles/wakefile1.json");

      });
      it('should set the path to be based in the home directory', function() {
        // TODO: test for the correct homedir concat
      });
      it('should have all functions', function() {
        expect(dg.fixOldFormat).to.be.a("function");
        expect(dg.serialize).to.be.a("function");
        expect(dg.getItems).to.be.a("function");
        expect(dg.getItemByName).to.be.a("function");
        expect(dg.indexOfDev).to.be.a("function");
        expect(dg.deviceExists).to.be.a("function");
        expect(dg.addItem).to.be.a("function");
        expect(dg.removeItem).to.be.a("function");
        expect(dg.updateItemTime).to.be.a("function");
        expect(dg.save).to.be.a("function");
        expect(dg.buildPath).to.be.a("function");
      });
    });
    describe("#getItems", function() {
      var macs = dg.getItems();
      it("should return and array", function() {
        expect(macs).to.be.an("array");
        expect(macs).to.have.length(0);
      });
      it("should return all the saved elements", function(){
        dg.addItem({name:"a"});
        dg.addItem({name:"b"});
        dg.addItem({name:"c"});
        dg.addItem({name:"d"});
        expect(dg.getItems()).to.have.length(4);
        dg.removeItem("a");
        expect(dg.getItems()).to.have.length(3);
        dg.removeItem("c");
        expect(dg.getItems()).to.have.length(2);
        dg.removeItem("b");
        expect(dg.getItems()).to.have.length(1);
        dg.removeItem("d");
        expect(dg.getItems()).to.have.length(0);
      });
    });
    describe("#buildPath", function() {
      it("should return a string path", function(){
        expect(dg.buildPath("test")).to.be.a("string");
      });
      it("should join the base-path with the path from the config file", function(){
        var path = dg.buildPath("/home/user");
        expect(path).to.be("/home/user/test/testWakefiles/wakefile1.json");
        path = dg.buildPath("../../");
        expect(path).to.be("../../test/testWakefiles/wakefile1.json");
        path = dg.buildPath("/");
        expect(path).to.be("/test/testWakefiles/wakefile1.json");
        path = dg.buildPath("./");
        expect(path).to.be("test/testWakefiles/wakefile1.json");
      });
    });
    describe("#getDataFromFile", function() {
      it("should read data form the file at the given path", function(){
        var conf = clone(config);
        conf.wakefile = "test/testWakefiles/wakefile2.json";
        var datget = require("../lib/dataGetter.js")(conf, ".");
        datget.getDataFromFile();
        var items = datget.getItems();
        expect(items).to.have.length(0);
      });
    });
    describe("#makeNewData", function() {
      it("should return and object with default values", function(){
        var data = dg.makeNewData();
        expect(data).to.be.an("object");
        expect(data.version).to.be(conf.version);
        expect(data.saved_macs).to.be.an("array");
        expect(data.saved_macs).to.have.length(0);
      });
      it("should ignore false input", function(){
        var data = dg.makeNewData("straw");
        expect(data).to.be.an("object");
        expect(data.version).to.be(conf.version);
        expect(data.saved_macs).to.be.an("array");
        expect(data.saved_macs).to.have.length(0);
        data = dg.makeNewData(true);
        expect(data).to.be.an("object");
        expect(data.version).to.be(conf.version);
        expect(data.saved_macs).to.be.an("array");
        expect(data.saved_macs).to.have.length(0);
      });
      it("should be able to set custom initial objects", function(){
        var data = dg.makeNewData({
          key1: [1,2,3,4,5],
          key2: true,
          key3: "testing"
        });
        expect(data).to.be.an("object");
        expect(data.key1).to.eql([1,2,3,4,5]);
        expect(data.key2).to.be(true);
        expect(data.key3).to.be("testing");
      });
    });
    describe("#parseFileData", function() {
      it("should return an object", function(){
        var data = dg.parseFileData('{"name": "test", "saved_macs": [] }');
        expect(data).to.be.an("object");
        expect(data).to.eql({name: "test", saved_macs: []});
      });
      it("should gracefully return null on bad input", function(){
        var data = dg.parseFileData("{'name' 'test', 'saved_macs': []}");
        expect(data).to.be(null);
      });
    });
    describe("#fixOldFormat", function() {

    });
    describe("#serialize", function() {

    });
    describe("#indexOfDev", function() {

    });
    describe("#deviceExists", function() {

    });
    describe("#addItem", function() {
      var macs = dg.getItems();
      expect(macs).to.have.length(0);
      dg.addItem({
        name: "test"
      });
      expect(dg.getItemByName("test")).to.be.an("object");
      macs = dg.getItems();
      expect(macs).to.have.length(1);
      dg.removeItem("test");
    });
    describe("#removeItem", function() {

    });
    describe("#updateItemTime", function() {

    });
    describe("#save", function() {

    });
  });
/*
  describe("Util", function() {
    var util = require("../lib/util.js")({}, config);
    describe("#constructor", function() {
      it("should return and object", function() {
        expect(util).to.be.an("object");
      });
      it("should have all the functions", function() {
        expect(util.checkMac).to.be.a("function");
        expect(util.failUp).to.be.a("function");
        expect(util.failAdd).to.be.a("function");
        expect(util.failRm).to.be.a("function");
        expect(util.failEdit).to.be.a("function");
        expect(util.beautifyMac).to.be.a("function");
        expect(util.uglifyMac).to.be.a("function");
      });
    });
    describe("#checkMac", function() {
      it("should return false on bad macs", function() {
        expect(util.checkMac("")).to.be(false);
        expect(util.checkMac("sd:se:34:ds:sd:ds")).to.be(false);
        expect(util.checkMac("23:23:23:23:23:23:2")).to.be(false);
        expect(util.checkMac(":2::::")).to.be(false);
        expect(util.checkMac("2343a375e367s")).to.be(false);
        expect(util.checkMac("34343434343")).to.be(false);
        expect(util.checkMac("sdsdbgbsdfff")).to.be(false);
        expect(util.checkMac("ab:ab:abab:ab:ab:")).to.be(false);
      });
      it("should return true on good macs", function() {
        expect(util.checkMac("23:23:23:23:23:23")).to.be(true);
        expect(util.checkMac("ab34bab5bac9")).to.be(true);
        expect(util.checkMac("34:ab:44:ce:45:ca")).to.be(true);
        expect(util.checkMac("babababababa")).to.be(true);
        expect(util.checkMac("111111111111")).to.be(true);
        expect(util.checkMac("343434343431")).to.be(true);
        expect(util.checkMac("aaaaaaaaaaaa")).to.be(true);
      });
    });
    describe("#beautifyMac", function() {
      it("should return a valid mac", function() {
        expect(util.checkMac(util.beautifyMac("aaaaaaaaaaaa"))).to.be(true);
        expect(util.checkMac(util.beautifyMac("343434343431"))).to.be(true);
        expect(util.checkMac(util.beautifyMac("111111111111"))).to.be(true);
        expect(util.checkMac(util.beautifyMac("ab34bab5bac9"))).to.be(true);
      });
      it("should return macs of the same size", function() {
        expect(util.beautifyMac("aaaaaaaaaaaa")).to.have.length(17);
        expect(util.beautifyMac("343434343431")).to.have.length(17);
        expect(util.beautifyMac("111111111111")).to.have.length(17);
        expect(util.beautifyMac("ab34bab5bac9")).to.have.length(17);
      });
      it("should fail on invalid macs", function() {
        expect(util.beautifyMac("0000000000")).to.be(false);
        expect(util.beautifyMac("00000000::00")).to.be(false);
      });
      it("should ignore beautiful macs", function() {
        expect(util.beautifyMac("21:23:23:23:23:23")).to.be("21:23:23:23:23:23");
        expect(util.beautifyMac("ab:ab:ab:ab:ab:ab")).to.be("ab:ab:ab:ab:ab:ab");
      });
    });
    describe("#uglifyMac", function() {
      it("should return a valid mac", function() {
        expect(util.checkMac(util.uglifyMac("21:23:23:23:23:23"))).to.be(true);
        expect(util.checkMac(util.uglifyMac("ab:ab:ab:ab:ab:ab"))).to.be(true);
        expect(util.checkMac(util.uglifyMac("ab:43:ab:34:ab:ab"))).to.be(true);
        expect(util.checkMac(util.uglifyMac("00:00:00:00:00:00"))).to.be(true);
      });
      it("should return macs of the same size", function() {
        expect(util.uglifyMac("21:23:23:23:23:23")).to.have.length(12);
        expect(util.uglifyMac("ab:ab:ab:ab:ab:ab")).to.have.length(12);
        expect(util.uglifyMac("ab:43:ab:34:ab:ab")).to.have.length(12);
        expect(util.uglifyMac("00:00:00:00:00:00")).to.have.length(12);
      });
      it("should fail on invalid macs", function() {
        expect(util.uglifyMac("ab:ab:ab:ab:ab:ab:")).to.be(false);
        expect(util.uglifyMac("ab:ab:abab:ab:ab:")).to.be(false);
        expect(util.uglifyMac("ab:ab:ab:ab:ab:ab:")).to.be(false);
        expect(util.uglifyMac("ab:ab:addb:ab:ab:ab")).to.be(false);
      });
      it("should not modify ugly macs", function() {
        expect(util.uglifyMac("ababaddbabab")).to.be("ababaddbabab");
        expect(util.uglifyMac("212121212121")).to.be("212121212121");
      });
    });
  });*/
});
