'use strict';

var Accessory, Service, Characteristic, UUIDGen;

module.exports = function(homebridge) {
    console.log("homebridge API version: " + homebridge.version);

    // Accessory must be created from PlatformAccessory Constructor
    Accessory = homebridge.platformAccessory;

    // Service and Characteristic are from hap-nodejs
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;
    UUIDGen = homebridge.hap.uuid;

    // For platform plugin to be considered as dynamic platform plugin,
    // registerPlatform(pluginName, platformName, constructor, dynamic), dynamic must be true
    homebridge.registerPlatform("homebridge-flh-hc2", "HC2ScenePlatfrom", HC2ScenePlatfrom);
}

function HC2ScenePlatfrom(log, config, api) {
	this.config = config || {};
	this.api = api;
	this.accessories = [];
  	this.log = log;
    
	if (api) {
    	// Save the API object as plugin needs to register new accessory via this object.
      	this.api = api;

      	// Listen to event "didFinishLaunching", this means homebridge already finished loading cached accessories
	    // Platform Plugin should only register new accessory that doesn't exist in homebridge after this event.
      	// Or start discover new accessories
      	this.api.on('didFinishLaunching', function() {
        	this.log("Plugin - DidFinishLaunching");
			this.addHC2Scenes();
      	}.bind(this));
 	}
}

HC2ScenePlatfrom.prototype.addHC2Scenes = function() {
    this.log('start adding HC2 Scenes ...');
    this.log('finish adding HC2 Scenes');
}