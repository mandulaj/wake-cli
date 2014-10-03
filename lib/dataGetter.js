var fs 		= require('fs'),
	path 	= require('path'),
	Table	= require('cli-table'),
	config 	= require("../config.json"),
	util	= require("./util.js");

// Initialize + load data
function DataGetter() {
	
	// Make the path to the db file
    var homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
	this.file = path.join(homeDir, ".wake.json");
	
	if (fs.existsSync(this.file)) {
		// read and parse the saved file
		try {
			this.data = JSON.parse(fs.readFileSync(this.file));
		} catch(e) {
			console.log(e)
			process.exit(-1);
		}
	} else {
		// make a new file
		this.data = {
			version: config.version,
			saved_macs: []
		};
		fs.writeFileSync(this.file, JSON.stringify(this.data));
	}
}

// get config
//TODO: implement config
DataGetter.prototype.getConfig = function(){
	//return this.data.config;
}

// get the list of saved items
DataGetter.prototype.savedItems = function(){
	return this.data.saved_macs;
}

DataGetter.prototype.deviceExists = function(name){
	var devices = this.savedItems();

	for(i in devices) {
		if (devices[i].name == name) {
			return true;
		}
	}
	return false;
}

DataGetter.prototype.addItem = function(device){
	this.data.saved_macs.push(device);
	this.save();
}

DataGetter.prototype.removeItem = function(name){
	var devices = this.savedItems();
	for(var i in devices) {
		if (devices[i].name == name) {
			break;
		}
	}
	this.data.saved_macs.splice(i,1);
	this.save();
}

DataGetter.prototype.listSaved = function(){
	var saved = this.savedItems();
	var table = new Table({
		head: ["Name".white.bold,"MAC".white.bold]
	});
	for( i in saved) {
		table.push([saved[i].name.green, util.beautifyMac(saved[i].mac).cyan]);
	}
	console.log(table.toString());
}

DataGetter.prototype.save = function(){
	fs.writeFileSync(this.file, JSON.stringify(this.data));
}

module.exports = new DataGetter();
