wake-cli
====

  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Build Status][travis-image]][travis-url]
  [![Dependencies Status][david-image]][david-url]
  [![Coveralls Status][coveralls-image]][coveralls-url]

Wake up your devices

A small command line tool for managing the MACs of your devices and sending out the magic packets.

!["Terminal Demo"](http://gifyu.com/images/ezgif-774878134.gif)

##Installation
As simple as `[sudo] npm install -g wake-cli`

You might have to enable the *Wake on lan* in the BIOS of your computer. _Note that not every network card has the WOL capability!_ You will have to do your research. Try [this](http://www.howtogeek.com/70374/how-to-geek-explains-what-is-wake-on-lan-and-how-do-i-enable-it/) for start.

##Usage
  Running the command above installs the program into your `$PATH`. The tool creates a `.wakefile` file in your home directory which is used as a database for the MACs.

####Up
  `wake up <MAC>|<name>`

  Use this command to wake up a device using a specific mac or the name stored in the database.
  You can use a list of macs/names separated by spaces to wake up several devices at once.

###List
  `wake list`

  Use this command to print a small table of all the saved MACs and the names you gave them.
  
  * `wake list -s <column>` - sort the list using the given column name
  
  * `wake list -r` - reverse the order

###Add
  `wake add <name> <MAC>`

  This command creates a new device in the database and saves it's MAC. The device will now appear in the list and you can use its name instead of the MAC.

###Rm
  `wake rm <name>`

  If you want to remove a device from the database you can do so with this command. It will ask you for a confirmation and then the device is permanently deleted from you contact list.

##Options
For any command you can use the `-h` option to get help with it.

  * `-h` - displays help text
  * `-v` - prints the version number

##Contribution
  * [Jakub Mandula](https://github.com/zpiman)

## Notice
  This project is still in development. There might be large changes in the interface and successive version might not be compatible. **I am not responsible for any emotional distress caused by the usage of this software!**


[npm-image]: https://img.shields.io/npm/v/wake-cli.svg?style=flat
[npm-url]: https://npmjs.org/package/wake-cli
[downloads-image]: https://img.shields.io/npm/dm/wake-cli.svg?style=flat
[downloads-url]: https://npmjs.org/package/wake-cli
[travis-image]: https://img.shields.io/travis/zpiman/wake-cli.svg?style=flat
[travis-url]: https://travis-ci.org/zpiman/wake-cli
[david-image]: https://img.shields.io/david/zpiman/wake-cli.svg?style=flat
[david-url]: https://david-dm.org/zpiman/wake-cli
[coveralls-url]: https://coveralls.io/r/zpiman/wake-cli
[coveralls-image]: https://img.shields.io/coveralls/zpiman/wake-cli.svg?style=flat
