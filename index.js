#! /usr/bin/env node

var wol 		= require('wake_on_lan'),
	optimist 	= require('optimist'),
	util		= require('./lib/util.js'),
	colors		= require('colors'),
	config		= require('./config.json'),
	dataGetter 	= require('./lib/dataGetter.js');

var argv = optimist.argv;

if (argv._.length == 0) {
	if (argv.h){
		console.log("TODO: help")
	} else if (argv.v) {
		console.log("Version: "+config.version)
	} else {
		console.log("  Usage:".red.bold + " wake {up|list|add}")
		console.log("  wake -h".bold + " for more help")
	}
	process.exit(0)
}

switch (argv._[0]) {
	case 'up':
		if (argv.h) {
			console.log("TODO: up help");
			process.exit(0);
		}
		var mac;
		// Do we have at least 2 arguments?
		if (argv._.length < 2) {
			util.failUp();
		}
		
		// Get the second argument
		var data = argv._[1]

		// if the argument is in the list of saved, get it...
		var device = util.getSaved(data, dataGetter.savedItems())
		if (!device) { // If not...
			if (!util.checkMac(data)) { // Is it even a mac?
				util.failUp();
			} else {
				mac = data;
				console.log("  Sending packet to ".green + mac)
			}
		} else {
			console.log("  Sending packet to ".green + device.name + "[" + util.beautifyMac(device.mac) + "]");
			mac = device.mac;
		}
		
		// OK we have the mac so send the packet
		wol.wake(mac, function(error){
			if (error !== null) {
				console.log(data)
			}
		});
		break;
	case 'list':
		dataGetter.listSaved();
		break;
	case 'add':
		if (argv.h) { // user wants help
			console.log("TODO: add help");
			process.exit(0);
		}

		if (argv._.length < 3) {
			util.failAdd();
			process.exit(-1);
		}

		// get the name and mac
		var name = argv._[1];
		var mac = argv._[2];

		// is the MAC valid?
		if (!util.checkMac(mac.toString())) {
			console.log("  Error: ".red + "Invalid MAC");
			process.exit(-1);
		}
		// check if the name is free
		if (dataGetter.deviceExists(name)) {
			console.log("  Error: ".red + "device '" + name + "' already exists!");
			process.exit(-1);
		}

		// use the uglifyed version for storage
		mac = util.uglifyMac(mac);

		// construct the object
		var device = {
			name: name,
			mac: mac,
			created: Date.now(),
			lastUse: Date.now()
		}

		// save the device
		dataGetter.addItem(device)
		break;
	default:
		console.log("  Usage:".red.bold + " wake {up|list|add}")
		console.log("  wake -h".bold + " for more help")
}

