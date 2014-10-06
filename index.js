#! /usr/bin/env node

var wol 		= require('wake_on_lan'),
	optimist 	= require('optimist').boolean('r'),
	util		= require('./lib/util.js')(optimist.argv),
	colors		= require('colors'),
	config		= require('./config.json'),
	prompt		= require('prompt'),
	helpFiles	= require('./helpfile.json'),
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
			printHelp("up");
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
		var device = util.getSaved(data, dataGetter.getItems())
		if (!device) { // If not...
			if (!util.checkMac(data)) { // Is it even a mac?
				util.failUp();
			} else {
				mac = data;
				console.log("  Sending magic packet to ".green + mac)
			}
		} else {
			console.log("  Sending magic packet to ".green + device.name + "[" + util.beautifyMac(device.mac) + "]");
			dataGetter.updateItemTime(device.name);
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
			printHelp("add");
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
			lastUse: "never"
		}

		// save the device
		dataGetter.addItem(device);

		if (argv.r) {
			console.log("  Sending magic packet to ".green + device.name + "[" + util.beautifyMac(device.mac) + "]");
			wol.wake(device.mac, function(error){
				if (error !== null) {
					console.log(data)
				}
			});
		}
		break;
	case 'rm':
		if (argv.h) { // user wants help
			printHelp("rm");
			process.exit(0);
		}

		if (argv._.length < 2) {
			util.failRm();
			process.exit(-1);
		}

		var name = argv._[1];

		var item = util.getSaved(name, dataGetter.getItems());
		if(item) { // does the item exist
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
			console.log("  Warning! ".yellow.bold + "You are about to remove " + item.name.cyan + " with MAC " + util.beautifyMac(item.mac).underline);
			prompt.message = ""; // remove the ugly messages and propts
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
	case "edit":
		if (argv.h) { // user wants help
			printHelp("edit");
			process.exit(0);
		}

		if (argv._.length < 2) {
			util.failEdit();
			process.exit(-1);
		}

		var toEdit = dataGetter.indexOf(argv._[1]);
		if ( toEdit == -1 ) {
			console.log("    Error: ".red + argv._[1] + " is not in the list");
			process.exit(-1);
		} else {
			toEdit = util.getSaved(argv._[1], dataGetter.getItems());
		}

		console.log(toEdit);

		break;
	default:
		printGeneralHelp();
}

function printGeneralHelp() {
	console.log("  Usage: ".red.bold + argv['$0'] + " {up|list|add|rm}");
	console.log("  " + argv['$0'].bold + " -h".bold + " for more help");
}

function printHelp(command) {
	var help = helpFiles[command];
	if (command === "main") {
		console.log("---------- " + "wake command help".bold + " ----------");
	} else {
		console.log("\nHelp file for ".red.bold + command.cyan.bold+":".cyan.bold);
	}
	console.log(help.description);
	console.log("\nExamples:".bold);
	for (i in help.examples) {
		console.log("  " + help.examples[i]);
	}
	console.log("\nOptions:".bold)
	for (i in help.options) {
		console.log("  " + help.options[i].name.magenta);
		console.log("    " + help.options[i].description)
	}
}

