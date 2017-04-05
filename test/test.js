var expect = require("expect.js");
var config = require("../config.json"); // the real config

var basePath = __dirname;

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
  // set up the local testing config
  var conf = clone(config);
  conf.wakefile = "./testWakefiles/wakefile1.json";
  var dg = require("../lib/dataGetter.js")(conf, basePath); // make the data getter instance
  dg.getDataFromFile(function(err, data) {
    if (err) expect().fail("Can't get data" + err);
    describe("DataGetter", function() {

      describe("#init", function() {

        it("should return and object", function() {
          expect(dg).to.be.an('object');
          expect(dg.filePath).to.be.a('string');
          expect(dg.data).to.be.an('object');
          expect(dg.config).to.eql(conf);
        });

        it('should use the provided base path', function() {
          expect(dg.filePath).to.be(__dirname + "/testWakefiles/wakefile1.json");
        });

        it('should used the default configuration when config null is provided', function() {
          var dg3 = require("../lib/dataGetter.js")(null, basePath);
          expect(dg3.config).to.eql(config); // default config
        });

        it('should used the default configuration when config false is provided', function() {
          var dg3 = require("../lib/dataGetter.js")(false, basePath);
          expect(dg3.config).to.eql(config); // default config
        });

        it('should used the default configuration when config undefined is provided', function() {
          var dg3 = require("../lib/dataGetter.js")(undefined, basePath);
          expect(dg3.config).to.eql(config); // default config
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
          expect(macs).to.have.length(1);
        });

        it("should return all the saved elements", function() {
          dg.addItem({
            name: "a"
          });
          dg.addItem({
            name: "b"
          });
          dg.addItem({
            name: "c"
          });
          dg.addItem({
            name: "d"
          });
          expect(dg.getItems()).to.have.length(5);
          dg.removeItem("a");
          expect(dg.getItems()).to.have.length(4);
          dg.removeItem("c");
          expect(dg.getItems()).to.have.length(3);
          dg.removeItem("b");
          expect(dg.getItems()).to.have.length(2);
          dg.removeItem("d");
          expect(dg.getItems()).to.have.length(1);
        });
      });

      describe("#buildPath", function() {

        it("should return a string path", function() {
          expect(dg.buildPath("test")).to.be.a("string");
        });

        it("should join the base-path with the path from the config file", function() {
          var path = dg.buildPath("/home/user");
          expect(path).to.be("/home/user/testWakefiles/wakefile1.json");
          path = dg.buildPath("../../");
          expect(path).to.be("../../testWakefiles/wakefile1.json");
          path = dg.buildPath("/");
          expect(path).to.be("/testWakefiles/wakefile1.json");
          path = dg.buildPath("./");
          expect(path).to.be("testWakefiles/wakefile1.json");
        });
      });

      describe("#getDataFromFile", function() {

        it("should read data form the file at the given path", function(done) {
          var conf = clone(config);
          conf.wakefile = "testWakefiles/wakefile2.json";
          var datget = require("../lib/dataGetter.js")(conf, basePath);
          datget.getDataFromFile(function(err, data) {
            if (err)
              expect().fail("Error while getting data: ", err);
            var items = datget.getItems();
            expect(items).to.have.length(0);
            done();
          }, true);
        });

        it("should return newly created data if file does not exist", function(done) {
          var conf = clone(config);
          conf.wakefile = "doesNotExistFilePath.json";
          var noFiledg = require("../lib/dataGetter.js")(conf, basePath); // make the data getter instance
          noFiledg.getDataFromFile(function(err, data) {
            if (err) expect().fail("Get data fail: " + err);
            expect(data).to.be.an("object");
            expect(data.saved_macs).to.eql([]);
            expect(data.version).to.eql(conf.version);
            done();
          });
        });

        it("should return an error on problem with file reading", function(done) {
          var conf = clone(config);
          // TODO: find a file that is on all OS but it is not readable
          conf.wakefile = "/dev/klog";
          var noFiledg = require("../lib/dataGetter.js")(conf, "/"); // make the data getter instance
          noFiledg.getDataFromFile(function(err, data) {
            //expect(data).to.be(null);
            //expect(err.code).to.be("EACCES");
            done();
          });
        });

        it("should return an error on bad input", function(done) {
          var conf = clone(config);
          conf.wakefile = "testWakefiles/badInput.json";
          var noFiledg = require("../lib/dataGetter.js")(conf, basePath); // make the data getter instance
          noFiledg.getDataFromFile(function(err, data) {
            expect(data).to.be(null);
            expect(err instanceof SyntaxError).to.be(true);
            done();
          });
        });

        it("should assign data to self by default", function(done) {
          var conf = clone(config);
          conf.wakefile = "testWakefiles/wakefile1.json";
          var noFiledg = require("../lib/dataGetter.js")(conf, basePath); // make the data getter instance
          noFiledg.getDataFromFile(function(err, data) {
            if (err) expect().fail("Error getting data" + err);
            expect(noFiledg.data).to.be.an("object");
            expect(noFiledg.data).to.only.have.keys("version", "saved_macs");
            done();
          });
        });

        it("should assign data to self when asked", function(done) {
          var conf = clone(config);
          conf.wakefile = "testWakefiles/wakefile1.json";
          var noFiledg = require("../lib/dataGetter.js")(conf, basePath); // make the data getter instance
          noFiledg.getDataFromFile(function(err, data) {
            if (err) expect().fail("Error getting data" + err);
            expect(noFiledg.data).to.be.an("object");
            expect(noFiledg.data).to.only.have.keys("version", "saved_macs");
            done();
          }, true);
        });

        it("should not assign data to self when assign is false", function(done) {
          var conf = clone(config);
          conf.wakefile = "testWakefiles/wakefile1.json";
          var noFiledg = require("../lib/dataGetter.js")(conf, basePath); // make the data getter instance
          noFiledg.getDataFromFile(function(err, data) {
            if (err) expect().fail("Error getting data" + err);
            expect(noFiledg.data).to.be.an("object");
            expect(noFiledg.data).to.eql({});
            done();
          }, false);
        });

        it("should assign data to self when new data is created", function(done) {
          var conf = clone(config);
          conf.wakefile = "testWakefiles/doesNotExistFilePath.json";
          var noFiledg = require("../lib/dataGetter.js")(conf, basePath); // make the data getter instance
          noFiledg.getDataFromFile(function(err, data) {
            if (err) expect().fail("Error getting data" + err);
            expect(noFiledg.data).to.be.an("object");
            expect(noFiledg.data).to.only.have.keys("version", "saved_macs");
            expect(noFiledg.data.saved_macs).to.have.length(0);
            done();
          });
        });

        it("should assign data to self when new data is created", function(done) {
          var conf = clone(config);
          conf.wakefile = "testWakefiles/doesNotExistFilePath.json";
          var noFiledg = require("../lib/dataGetter.js")(conf, basePath); // make the data getter instance
          noFiledg.getDataFromFile(function(err, data) {
            if (err) expect().fail("Error getting data" + err);
            expect(noFiledg.data).to.be.an("object");
            expect(noFiledg.data).to.eql({});
            done();
          }, false);
        });
      });

      describe("#makeNewData", function() {

        it("should return and object with default values", function() {
          var data = dg.makeNewData();
          expect(data).to.be.an("object");
          expect(data.version).to.be(conf.version);
          expect(data.saved_macs).to.be.an("array");
          expect(data.saved_macs).to.have.length(0);
        });

        it("should ignore false input", function() {
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

        it("should be able to set custom initial objects", function() {
          var data = dg.makeNewData({
            key1: [1, 2, 3, 4, 5],
            key2: true,
            key3: "testing"
          });
          expect(data).to.be.an("object");
          expect(data.key1).to.eql([1, 2, 3, 4, 5]);
          expect(data.key2).to.be(true);
          expect(data.key3).to.be("testing");
        });
      });

      describe("#parseFileData", function() {

        it("should return an object", function(done) {
          var data = dg.parseFileData('{"version": "0.0.0", "saved_macs": [] }', function(err, data) {
            if (err)
              expect().fail("Error parsing file ", err);
            expect(data).to.be.an("object");
            expect(data).to.eql({
              version: config.version,
              saved_macs: []
            });
            done();
          });
        });

        it("should gracefully return null on bad input", function(done) {
          var data = dg.parseFileData("{'name' 'test', 'saved_macs': []}", function(err, data) {
            expect(data).to.be(null);
            expect(err).to.not.be(null);
            done();
          });
        });
      });

      describe("#fixOldFormat", function() {

        it("should return the data unchanged if nothing is to edit", function() {
          var input = {
            version: config.version,
            saved_macs: [{
              name: "test1",
              mac: "232323232323",
              created: Date.now(),
              lastUse: -Infinity,
            }, {
              name: "test2",
              mac: "232323232323",
              created: Date.now(),
              lastUse: -Infinity,
            }, {
              name: "test3",
              mac: "232323232323",
              created: Date.now(),
              lastUse: -Infinity,
            }]
          };
          var result = dg.fixOldFormat(input);
          expect(result).to.eql(input);
        });

        it("should update old `lastUse` value", function() {
          var input = {
            version: config.version,
            saved_macs: [{
              name: "test1",
              mac: "232323232323",
              created: 3423423432423,
              lastUse: "never",
            }, {
              name: "test2",
              mac: "232323232323",
              created: 3423423432423,
              lastUse: "never",
            }, {
              name: "test3",
              mac: "232323232323",
              created: 3423423432423,
              lastUse: "never",
            }]
          };
          var expected = {
            version: config.version,
            saved_macs: [{
              name: "test1",
              mac: "232323232323",
              created: 3423423432423,
              lastUse: -Infinity,
            }, {
              name: "test2",
              mac: "232323232323",
              created: 3423423432423,
              lastUse: -Infinity,
            }, {
              name: "test3",
              mac: "232323232323",
              created: 3423423432423,
              lastUse: -Infinity,
            }]
          };
          var result = dg.fixOldFormat(input);
          expect(result).to.eql(expected);
        });
      });

      describe("#serialize", function() {

        it("should leave OK values intact", function() {
          var input = {
            version: config.version,
            saved_macs: [{
              name: "test1",
              mac: "232323232323",
              created: Date.now(),
              lastUse: -Infinity,
            }, {
              name: "test2",
              mac: "232323232323",
              created: Date.now(),
              lastUse: Date.now(),
            }, {
              name: "test3",
              mac: "232323232323",
              created: Date.now(),
              lastUse: 23423424223,
            }]
          };
          var result = dg.serialize(input);
          expect(result).to.eql(input);
        });

        it("should convert null in lastUse filed to -Infinity", function() {
          var input = {
            version: config.version,
            saved_macs: [{
              name: "test1",
              mac: "232323232323",
              created: 3423423432423,
              lastUse: null,
            }, {
              name: "test2",
              mac: "232323232323",
              created: 3423423432423,
              lastUse: null,
            }, {
              name: "test3",
              mac: "232323232323",
              created: 3423423432423,
              lastUse: null,
            }]
          };
          var expected = {
            version: config.version,
            saved_macs: [{
              name: "test1",
              mac: "232323232323",
              created: 3423423432423,
              lastUse: -Infinity,
            }, {
              name: "test2",
              mac: "232323232323",
              created: 3423423432423,
              lastUse: -Infinity,
            }, {
              name: "test3",
              mac: "232323232323",
              created: 3423423432423,
              lastUse: -Infinity,
            }]
          };
          var result = dg.serialize(input);
          expect(result).to.eql(expected);
        });
      });

      describe("#indexOfDev", function() {

        it("should give index of dev by name", function() {
          expect(dg.indexOfDev("firstEntry")).to.be(0);
          dg.addItem({
            name: "firstInsert"
          }); // Add first item
          expect(dg.indexOfDev("firstInsert")).to.be(1);
          dg.addItem({
            name: "secondInsert"
          }); // Add second item
          expect(dg.indexOfDev("secondInsert")).to.be(2);
          dg.addItem({
            name: "thirdInsert"
          }); // add third item
          expect(dg.indexOfDev("thirdInsert")).to.be(3);
          dg.removeItem("secondInsert"); // remove second item
          expect(dg.indexOfDev("firstEntry")).to.be(0); // Check if all is ok
          expect(dg.indexOfDev("firstInsert")).to.be(1);
          expect(dg.indexOfDev("thirdInsert")).to.be(2);
          dg.removeItem("firstInsert"); // Remove first item
          expect(dg.indexOfDev("firstEntry")).to.be(0); // Check again
          expect(dg.indexOfDev("thirdInsert")).to.be(1);
          dg.removeItem("thirdInsert"); // Remove third item
          expect(dg.indexOfDev("firstEntry")).to.be(0); // Check all items once more
          expect(dg.indexOfDev("firstInsert")).to.be(-1);
          expect(dg.indexOfDev("secondInsert")).to.be(-1);
          expect(dg.indexOfDev("thirdInsert")).to.be(-1);
        });

        it("should return -1 when item not found", function() {
          expect(dg.indexOfDev("firstInsert")).to.be(-1);
          expect(dg.indexOfDev("secondInsert")).to.be(-1);
          expect(dg.indexOfDev("thirdInsert")).to.be(-1);
          expect(dg.indexOfDev("fourthInsert")).to.be(-1);
          expect(dg.indexOfDev("fifthInsert")).to.be(-1);
          expect(dg.indexOfDev("sixthInsert")).to.be(-1);
        });
      });

      describe("#deviceExists", function() {

        it("should return true if device is in the list", function() {
          expect(dg.deviceExists("firstEntry")).to.be(true);
          dg.addItem({
            name: "firstInsert"
          }); // Add first item
          expect(dg.deviceExists("firstInsert")).to.be(true);
          dg.addItem({
            name: "secondInsert"
          }); // Add second item
          expect(dg.deviceExists("secondInsert")).to.be(true);
          dg.addItem({
            name: "thirdInsert"
          }); // add third item
          expect(dg.deviceExists("thirdInsert")).to.be(true);
          dg.removeItem("secondInsert"); // remove second item
          expect(dg.deviceExists("firstEntry")).to.be(true); // Check if all is ok
          expect(dg.deviceExists("firstInsert")).to.be(true);
          expect(dg.deviceExists("thirdInsert")).to.be(true);
          dg.removeItem("firstInsert"); // Remove first item
          expect(dg.deviceExists("firstEntry")).to.be(true); // Check again
          expect(dg.deviceExists("thirdInsert")).to.be(true);
          dg.removeItem("thirdInsert"); // Remove third item
          expect(dg.deviceExists("firstEntry")).to.be(true); // Check all items once more
          expect(dg.deviceExists("firstInsert")).to.be(false);
          expect(dg.deviceExists("secondInsert")).to.be(false);
          expect(dg.deviceExists("thirdInsert")).to.be(false);
        });

        it("should return false if device does not exist", function() {
          expect(dg.deviceExists("firstInsert")).to.be(false);
          expect(dg.deviceExists("secondInsert")).to.be(false);
          expect(dg.deviceExists("thirdInsert")).to.be(false);
          expect(dg.deviceExists("fourthInsert")).to.be(false);
          expect(dg.deviceExists("fifthInsert")).to.be(false);
          expect(dg.deviceExists("sixthInsert")).to.be(false);
        });
      });

      describe("#addItemByName", function() {

        it("should get the item using it's name property", function() {
          var macs = dg.getItems();
          expect(macs).to.have.length(1);
          dg.addItem({
            name: "test12341234"
          });

          expect(dg.getItemByName("test12341234")).to.be.an("object");
          macs = dg.getItems();
          expect(macs).to.have.length(2);
          dg.removeItem("test12341234");
        });

        it("should return -1 when item is not found", function() {
          var result = dg.getItemByName("doesNotExist");
          expect(result).to.be.empty();
        });
      });

      describe("#removeItem", function() {

      });

      describe("#updateItemTime", function() {

        it("should update the time to current time", function(done) {
          var conf = clone(config);
          conf.wakefile = "testWakefiles/wakefile4.json";
          var noFiledg = require("../lib/dataGetter.js")(conf, basePath); // make the data getter instance
          noFiledg.getDataFromFile(function(err, data) {
            if (err) expect().fail(err);
            var devices = noFiledg.getItems(); // Get all devices
            for (var i in devices) { // For each device
              var dev = clone(devices[i]); // get the device
              noFiledg.updateItemTime(dev.name); // Update its time
              var time = Date.now(); // Get the time now
              var newDev = noFiledg.getItemByName(dev.name)[0]; // Get the device using its name with updated time
              expect(newDev.lastUse - time).to.be.below(100); // Expect the new device to have recent use (max 100ms timeout)
            }
            done();
          });
        });

        it("should not change other fields", function(done) {
          var conf = clone(config);
          conf.wakefile = "testWakefiles/wakefile4.json";
          var noFiledg = require("../lib/dataGetter.js")(conf, basePath); // make the data getter instance
          noFiledg.getDataFromFile(function(err, data) {
            if (err) expect().fail(err);
            var devices = noFiledg.getItems(); // Get all devices
            for (var i in devices) { // For each device
              var dev = clone(devices[i]); // get the device
              noFiledg.updateItemTime(dev.name); // Update its time
              expect(dev).to.not.eql(devices[i]); // the two should be different now
              dev.lastUse = devices[i].lastUse; // set the time back to the original
              expect(dev).to.eql(devices[i]); // check if any other fields changed
            }
            done();
          });
        });
      });

      describe("#save", function() {
        var saveConfig = clone(config);
        saveConfig.wakefile = "./testWakefiles/wakefile3.json";

        it("should save items to file", function(done) {
          var dgFirst = require("../lib/dataGetter.js")(saveConfig, basePath);
          dgFirst.getDataFromFile(function() {
            var items_before = dgFirst.getItems();
            expect(items_before).to.have.length(0);

            dgFirst.addItem({
              name: "test1"
            });
            dgFirst.addItem({
              name: "test2"
            });
            dgFirst.addItem({
              name: "test3"
            });
            var items_next = dgFirst.getItems();
            expect(items_next).to.have.length(3);
            dgFirst.save();

            var dg4 = require("../lib/dataGetter.js")(saveConfig, basePath);
            dg4.getDataFromFile(function(err, data) {
              if (err) expect().fail("Error while reading file" + err);
              dg4.parseFileData(data, function(err, data) {

                if (err) expect().fail("Error while parsing file" + err);
                var after = dg4.getItems();
                expect(after).to.have.length(3);
                dg4.removeItem("test1");
                dg4.removeItem("test2");
                dg4.removeItem("test3");
                dg4.save();
                done();
              });
            });
          });
        });

        it("should use asyc method when a callback is provided", function(done) {
          var dgFirst = require("../lib/dataGetter.js")(saveConfig, basePath);
          dgFirst.getDataFromFile(function() {
            var items_before = dgFirst.getItems();
            expect(items_before).to.have.length(0);

            dgFirst.addItem({
              name: "test1"
            });
            dgFirst.addItem({
              name: "test2"
            });
            dgFirst.addItem({
              name: "test3"
            });
            var items_next = dgFirst.getItems();
            expect(items_next).to.have.length(3);
            dgFirst.save(function() {
              var dg4 = require("../lib/dataGetter.js")(saveConfig, basePath);
              dg4.getDataFromFile(function(err, data) {
                if (err) expect().fail("Error while reading file" + err);
                dg4.parseFileData(data, function(err, data) {
                  if (err) expect().fail("Error while parsing file" + err);
                  var after = dg4.getItems();
                  expect(after).to.have.length(3);
                  dg4.removeItem("test1");
                  dg4.removeItem("test2");
                  dg4.removeItem("test3");
                  dg4.save(function() {
                    done();
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  describe("Util", function() {
    var conf = clone(config);
    conf.wakefile = basePath;
    var util = require("../lib/util.js")(conf);
    describe("#constructor", function() {

      it("should return and object", function() {
        expect(util).to.be.an("object");
      });

      it("should override default config if it is provided", function() {
        expect(util.config).to.eql(conf);
        expect(util.config).to.not.eql(config);
      });

      it("should use default config if no config is provided", function() {
        var defUtil = require("../lib/util.js")();
        expect(defUtil.config).to.eql(config);
        expect(defUtil.config).to.not.eql(conf);
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
        expect(util.beautifyMac("AB:AB:AB:AB:AB:AB")).to.be("AB:AB:AB:AB:AB:AB");
      });

      it("should convert to uppercase", function() {
        expect(util.beautifyMac("ab:cd:ef:23:23:23")).to.be("AB:CD:EF:23:23:23");
        expect(util.beautifyMac("aB:cD:eF:AB:AB:AB")).to.be("AB:CD:EF:AB:AB:AB");
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
        expect(util.uglifyMac("ababaddbabab")).to.be("ABABADDBABAB");
        expect(util.uglifyMac("212121212121")).to.be("212121212121");
      });
      it("should convert to lowercase", function() {
        expect(util.uglifyMac("ababaddbabab")).to.be("ABABADDBABAB");
        expect(util.uglifyMac("abcdefabcedf")).to.be("ABCDEFABCEDF");
        expect(util.uglifyMac("ab:cd:ef:12:34:56")).to.be("ABCDEF123456");
      });

    });

    describe("#failUp", function() {

      it("should return the correct message", function() {
        var msg = util.failUp();
        expect(msg).to.be.a("string");
        //expect(msg).to.match("Usage");
        expect(msg).to.match(/.*up.*/);
        //expect(msg).to.be('\u001b[1m\u001b[31m  Usage: \u001b[39m\u001b[22mtest up <MAC>||<saved item>\n  \u001b[1mtest\u001b[22m\u001b[1m up -h\u001b[22m for more help');
      });
    });

    describe("#failAdd", function() {

      it("should return the correct message", function() {
        var msg = util.failAdd();
        expect(msg).to.be.a("string");
        //expect(msg).to.be('\u001b[1m\u001b[31m  Usage: \u001b[39m\u001b[22mtest add <name> <MAC>\n  \u001b[1mtest\u001b[22m\u001b[1m add -h\u001b[22m for more help');
      });
    });

    describe("#failRm", function() {

      it("should return the correct message", function() {
        var msg = util.failRm();
        expect(msg).to.be.a("string");
        //expect(msg).to.be('\u001b[1m\u001b[31m  Usage: \u001b[39m\u001b[22mtest rm <name>\n  \u001b[1mtest\u001b[22m\u001b[1m rm -h\u001b[22m for more help');
      });
    });

    describe("#failEdit", function() {

      it("should return the correct message", function() {
        var msg = util.failEdit();
        expect(msg).to.be.a("string");
        //expect(msg).to.be('\u001b[1m\u001b[31m  Usage: \u001b[39m\u001b[22mtest edit <name>\n  \u001b[1mtest\u001b[22m\u001b[1m edit -h\u001b[22m for more help');
      });
    });
    describe("#decolorize", function() {
      it("should remove all special chars from a color string", function() {
        var str1 = "Hello World";
        var str2 = "This is a test";
        var str3 = "I hope it works";
        var str4 = "Wake cli for the win";
        var str5 = "3.1415";
        var str6 = "OpensourceFTW";
        expect(util.decolorize(str1.red)).to.be(str1);
        expect(util.decolorize(str1.red + str2.underline.bold.green)).to.be(str1 + str2);
        expect(util.decolorize(str4.rainbow)).to.be(str4);
        expect(util.decolorize(str5 + str1.green + str3.bold.green.underline)).to.be(str5 + str1 + str3);
        expect(util.decolorize(str6.rainbow.underline.bold)).to.be(str6);
      });
    });
  });

  describe("TermRender", function() {
    var conf = clone(config);
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
        var conf = clone(config);
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
        var conf = clone(config);
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
        var conf = clone(config);
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
});
