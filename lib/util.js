
function Util(){

}

// Returns the saved device mac object if it is in list else returns false
Util.prototype.getSaved = function(device, list) {
	for (index in list) {
		if (list[index].name == device) {
			return list[index];
		}
	}
	return false;
}


// Returns true if `mac` is a valid MAC
Util.prototype.checkMac = function(mac) {
	if (mac.length == 17) {
    	mac = mac.replace(new RegExp(mac[2], 'g'), '');
	}
	if (mac.length != 12 || mac.match(/[^a-fA-F0-9]/)) {
		return false;
	}
	return true;
}

// Print fail and exit
Util.prototype.failUp = function(){
	console.log("  Usage: ".red.bold + "wake up <mac>||<saved item>")
	console.log("  wake up -h".bold + " for more help");
	process.exit(-1);
}

Util.prototype.beautifyMac = function(mac) {
	var newMac = [];
	for (var i = 0; i < mac.length; i+=2) {
		newMac.push(mac.slice(i,i+2));
	}
	return newMac.join(":");
}
module.exports = new Util();