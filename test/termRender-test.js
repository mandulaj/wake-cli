var expect = require("expect.js");
var config = require("../config.json"); // the real config
var utils = require("./utils.js");

var basePath = __dirname;

describe("TermRender", function() {
  var conf = utils.clone(config);
  conf.wakefile = "testWakefiles/wakefile5.json";
  var dg = require("../lib/dataGetter.js")(conf, basePath);
  var td = require("../lib/termRender.js")(dg);
  describe("#constructor", function() {
    it("should create an object with all the methods", function() {
      expect(td).to.be.an("object");
    });
    it("should have all the methods", function() {
      expect(td.cloneArray).to.be.a("function");
      expect(td.sortList).to.be.a("function");
      expect(td.renderList).to.be.a("function");
    });
  });

  describe("#cloneArray", function() {
    it("should return an identical array of any value", function() {
      var array = [0, "string", null, {
        a: 0
      }, true, [1, 2, 3, 4], function(x) {
        return x * x;
      }];
      var copy_array = td.cloneArray(array);
      expect(copy_array).to.eql(array); // TODO: should really equal() not just eql()
    });
    it("should return a clone", function() {
      var array = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      var array_clone = array;
      array_clone[0] = "changed";
      expect(array_clone).to.equal(array);
      array_clone = td.cloneArray(array);
      array_clone[0] = false;
      expect(array_clone).to.not.equal(array);
    });
  });

  describe("#sortList", function() {
    var array1 = [{
      name: "a",
      mac: "666666666666",
      lastUsed: 15
    }, {
      name: "b",
      mac: "555555555555",
      lastUsed: 12
    }, {
      name: "c",
      mac: "444444444444",
      lastUsed: 13
    }, {
      name: "d",
      mac: "333333333333",
      lastUsed: 17
    }, {
      name: "e",
      mac: "222222222222",
      lastUsed: 20
    }, {
      name: "f",
      mac: "111111111111",
      lastUsed: 10
    }];
    var array2 = [{
      name: "f",
      mac: "111111111111",
      lastUsed: 10
    }, {
      name: "e",
      mac: "222222222222",
      lastUsed: 20
    }, {
      name: "d",
      mac: "333333333333",
      lastUsed: 17
    }, {
      name: "c",
      mac: "444444444444",
      lastUsed: 13
    }, {
      name: "b",
      mac: "555555555555",
      lastUsed: 12
    }, {
      name: "a",
      mac: "666666666666",
      lastUsed: 15
    }];
    it("should sort the array of objects by the given name", function() {
      var result = td.sortList("mac", false, array1);
      expect(result).to.eql(array2);
    });
    it("should reverse the sort if asked to do so", function() {
      var result = td.sortList("mac", true, array2);
      expect(result).to.eql(array1);
    });
  });

  describe("#renderList", function() {
    it("should return a string", function(done) {
      var conf = utils.clone(config);
      conf.wakefile = "testWakefiles/wakefile5.json";
      var dg = require("../lib/dataGetter.js")(conf, basePath);
      dg.getDataFromFile(function() {
        var td = require("../lib/termRender.js")(dg);
        dg.addItem({
          name: "test1",
          mac: "121212121212",
          lastUse: 0
        });
        var result = td.renderList();
        expect(result).to.be.a("string");
        expect(result).to.match(/Name/);
        expect(result).to.match(/MAC/);
        expect(result).to.match(/Used/);
        done();
      });
    });
    it("should convert -Infinity to 'never'", function(done) {
      var conf = utils.clone(config);
      conf.wakefile = "testWakefiles/wakefile5.json";
      var dg = require("../lib/dataGetter.js")(conf, basePath);
      dg.getDataFromFile(function() {
        var td = require("../lib/termRender.js")(dg);
        dg.addItem({
          name: "test1",
          mac: "121212121212",
          lastUse: -Infinity
        });
        var result = td.renderList();
        expect(result).to.match(/never/);
        done();
      });
    });
    it("should beautify the Mac", function(done) {
      var conf = utils.clone(config);
      conf.wakefile = "testWakefiles/wakefile5.json";
      var dg = require("../lib/dataGetter.js")(conf, basePath);
      dg.getDataFromFile(function() {
        var td = require("../lib/termRender.js")(dg);
        dg.addItem({
          name: "test1",
          mac: "121212121212",
          lastUse: 0
        });
        var result = td.renderList();
        expect(result).to.match(/12:12:12:12:12:12/);
        done();
      });
    });
  });

  describe("#renderGeneralHelp", function() {
    var res = td.renderGeneralHelp();
    it("should be a string", function() {
      expect(res).to.be.a("string");
    });
    it("should have the main parts", function() {
      expect(res).to.match(/Usage/);
      // TODO: add more checks
    });
  });

  describe("#renderHelp", function() {
    it("should return a string", function() {
      expect(td.renderHelp("main")).to.be.a("string");
    });
    it("should return a default message on unknown command", function() {
      var res1 = td.renderHelp("blah");
      var res2 = td.renderHelp("3.14159265");
      var res3 = td.renderHelp("thisisatest");

      expect(res1).to.match(/does not exist/);
      expect(res1).to.match(/blah/);
      expect(res2).to.match(/does not exist/);
      expect(res2).to.match(/3.14159265/);
      expect(res3).to.match(/does not exist/);
      expect(res3).to.match(/thisisatest/);
    });
    it("should return the correct help message on main", function() {
      var res = td.renderHelp("main");
      expect(res).to.match(/Wake command help/);
    });
    it("should return the help files for correct commands", function() {
      var add = td.renderHelp("add");
      var rm = td.renderHelp("rm");
      //var edit = td.renderHelp("edit");
      var up = td.renderHelp("up");
      var list = td.renderHelp("list");

      expect(add).to.not.match(/does not exist/);
      expect(rm).to.not.match(/does not exist/);
      //expect(edit).to.not.match(/does not exist/);
      expect(up).to.not.match(/does not exist/);
      expect(list).to.not.match(/does not exist/);


      expect(add).to.match(/Examples/);
      expect(add).to.match(/Options/);
      expect(rm).to.match(/Examples/);
      expect(rm).to.match(/Options/);
      //expect(edit).to.match(/Examples/);
      //expect(edit).to.match(/Options/);
      expect(up).to.match(/Examples/);
      expect(up).to.match(/Options/);
      expect(list).to.match(/Examples/);
      expect(list).to.match(/Options/);


    });
  });
});
