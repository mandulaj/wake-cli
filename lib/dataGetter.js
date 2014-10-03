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
		fs.writeFileSync(this.file, JSON.stringify(data));
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

module.exports = new DataGetter();
