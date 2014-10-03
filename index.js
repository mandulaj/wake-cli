#! /usr/bin/env node

var wol 		= require('wake_on_lan'),
	optimist 	= require('optimist'),
	util		= require('./lib/util.js'),
	colors		= require('colors'),
	config		= require('./config.json'),
	prompt		= require('prompt'),
	dataGetter 	= require('./lib/dataGetter.js');

var argv = optimist.argv;

if (argv._.length == 0) {
	if (argv.h){
		console.log("TODO: help");
	} else if (argv.v) {
		console.log("Version: "+config.version);
	} else {
		printGeneralHelp();
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
	case 'rm':
		if (argv.h) { // user wants help
			console.log("TODO: rm help");
			process.exit(0);
		}

		if (argv._.length < 2) {
			util.failRm();
			process.exit(-1);
		}

		var name = argv._[1];

		var item = util.getSaved(name, dataGetter.savedItems());

		if(item) {
			var schema = {
				properties: {
					confirm: {
						description: "Are you sure? [y/n]",
						type: 'string',
						pattern: "^[yn]",
						message: "Only type 'y' or 'n'",
						required: true
					}
				}
			}
			prompt.message = "";
			prompt.delimiter = "";
			prompt.start();

			prompt.get(schema, function(err, data){
				if (err) {
					throw err;
				}
				if (data.confirm == "y") {
					dataGetter.removeItem(name);
				} else {
					process.exit(0);
				}
			});
			
		} else {
			console.log("   Error: ".red + "device '" + name + "' does not exist");
		}
		break;
	default:
		printGeneralHelp();
}

function printGeneralHelp() {
	console.log("  Usage:".red.bold + " wake {up|list|add|rm}");
	console.log("  wake -h".bold + " for more help");
}

