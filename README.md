wake-cli
====

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Build Status][travis-image]][travis-url]

Wake up your devices

A small command line tool for managing the MACs of your devices and sending out the magic packets.

##Installation
As simple as `[sudo] npm install -g wake-cli`

You might have to enable the *Wake on lan* in the BIOS of your computer. _Note that not every network card has the WOL capability!_ You will have to do your research. Try [this](http://www.howtogeek.com/70374/how-to-geek-explains-what-is-wake-on-lan-and-how-do-i-enable-it/) for start.

##Usage
  Running the command above installs the program into your `$PATH`. The tool creates a `.wakefile` file in your home directory which is used as a database for the MACs.

####Up
  `wake up <MAC>|<name>`

  Use this command to wake up a device using a specific mac or the name stored in the database.

###List
  `wake list`

  Use this command to print a small table of all the saved MACs and the names you gave them.

###Add
  `wake add <name> <MAC>`

  This command creates a new device in the database and saves it's MAC. The device will now appear in the list and you can use its name instead of the MAC.

###Rm
  `wake rm <name>`

  If you want to remove a device from the database you can do so with this command. It will ask you for a confirmation and then the device is permanently deleted from you contact list.

##Options
For any command you can use the `-h` option to get help with it.

  `-h` - displays help text
  `-v` - prints the version number

##Contribution
  * [Jakub Mandula](https://github.com/zpiman)

