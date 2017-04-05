var expect = require("expect.js");
var config = require("../config.json"); // the real config
var utils = require("./utils.js");

var basePath = __dirname;

describe("Util", function() {
  var conf = utils.clone(config);
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
