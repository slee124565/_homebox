'use strict';

var PLUGIN_NAME = 'homebridge-flh-hc2';
var PLATFORM_NAME = 'HC2ScenePlatform'

var http = require('http');
var HC2 = require('./lib/hc2');

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
    homebridge.registerPlatform(PLUGIN_NAME, PLATFORM_NAME, HC2ScenePlatform, true);
}

function HC2ScenePlatform(log, config, api) {
    log("HC2ScenePlatform Init");
    
	this.config = config || {};
	this.api = api;
	this.accessories = [];
  	this.log = log;

    this.requestServer = http.createServer(function(request, response) {
        
        if (request.url === "/add") {
            this.addHC2Scenes();
            response.writeHead(204);
            response.end();
        }

        /*
        if (request.url == "/reachability") {
            this.updateAccessoriesReachability();
            response.writeHead(204);
            response.end();
        }*/

        if (request.url == "/remove") {
            this.removeAccessory();
            response.writeHead(204);
            response.end();
        }
    }.bind(this));

    this.requestServer.listen(18083, function() {
        log("Platform Server Listening...");
    });
    
	if (api) {
    	// Save the API object as plugin needs to register new accessory via this object.
      	this.api = api;

      	// Listen to event "didFinishLaunching", this means homebridge already finished loading cached accessories
	    // Platform Plugin should only register new accessory that doesn't exist in homebridge after this event.
      	// Or start discover new accessories
      	this.api.on('didFinishLaunching', function() {
        	this.log("Plugin - DidFinishLaunching");
			//this.addHC2Scenes();
      	}.bind(this));
 	} else {
        this.log('no api object');
    }
}

HC2ScenePlatform.prototype.addHC2Scenes = function() {
    this.log('Add HC2 Room Scenes');
    
    var hc2 = new HC2();
    var roomScenes = hc2.get_visible_room_scenes();
    
    if (roomScenes.length == 0) {
        this.log('No HC2 Room Scenes Exist!');
        return
    }
    
    for (var i = 0; i < roomScenes.length; i++) {
        
        var t_scene = roomScenes[i];
        var accessoryName = t_scene.roomName + t_scene.sceneName;
        var uuid_sed = accessoryName + t_scene.sceneID;
        var uuid = UUIDGen.generate(uuid_sed);
        this.log('add scene id ' + t_scene.sceneID 
                 + ' ' + t_scene.sceneName 
                 + ' with room ' + t_scene.roomName
                 + ' with uuid ' + uuid);
        
        /*
        var t_accessory = this.getPlatformAccessory(uuid);

        if (t_accessory == null) {
            
            var newAccessory = new Accessory(accessoryName, uuid);
            
            newAccessory.on('identify', function(paired, callback) {
                platform.log(accessory.displayName, "Identify!!!");
                callback();
            });
            newAccessory.addService(Service.StatelessProgrammableSwitch, "劇院模式")
                .getCharacteristic(Characteristic.On)
                .on('set', function(value, callback) {
                        platform.log(accessory.displayName, "Light -> " + value);
                        callback();
            });

            
        }*/
        
    }
    
}

HC2ScenePlatform.prototype.removeAccessory = function() {
    this.log("Remove Accessory");
    
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, this.accessories);
    this.accessories = [];
}

HC2ScenePlatform.prototype.getPlatformAccessory = function(uuid) {
    this.log('get Platform Accessory ' + uuid);
}

HC2ScenePlatform.prototype.existingAccessory = function(sceneID) {
    
	for (var a in this.accessories) {
		if (this.accessories[a].context.scendID == sceneID) {
			return this.accessories[a];
		}
	}
    
	return null;
}

HC2ScenePlatform.prototype.configureAccessory = function(accessory) {
    this.log(accessory.displayName, "Configure Accessory");
}

HC2ScenePlatform.prototype.configurationRequestHandler = function(context, request, callback) {
    this.log(accessory.displayName, "Configure Request Handler");
    
}

