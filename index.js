#! /usr/bin/env node

var wol 		= require('wake_on_lan'),
	optimist 	= require('optimist'),
	util		= require('./lib/util.js'),
	colors		= require('colors'),
	dataGetter 	= require('./lib/dataGetter.js');

//console.log(optimist)

switch (optimist.argv._[0]) {
	case 'up':
		var mac;
		// Do we have at least 2 arguments?
		if (optimist.argv._.length < 2) {
			util.failUp();
		}
		
		// Get the second argument
		var data = optimist.argv._[1]

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
	default:
		console.log("  Usage:".red.bold + " wake {up|list|add}")
		console.log("  wake -h".bold + " for more help")
}

