'use strict';

var PLUGIN_NAME = 'homebridge-flh-hc2';
var PLATFORM_NAME = 'HC2ScenePlatform'
var WEB_API_PORT = 18083;

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
    
	this.accessories = {};

    this.config = config || {};
	this.api = api;
  	this.log = log;
    this.platformName = PLATFORM_NAME;
    this.pluginName = PLUGIN_NAME;

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
            this.removeAccessories();
            response.writeHead(204);
            response.end();
        }
    }.bind(this));

    this.requestServer.listen(WEB_API_PORT, function() {
        log("Platform " + this.platformName + " Server Listening...");
    });
    
    this.api.on('didFinishLaunching', function() {
        this.log("Plugin - DidFinishLaunching");
    }.bind(this));
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
        if (t_scene.roomName.charAt(0) != "_")
            this.addSceneAccessory(uuid, t_scene.sceneID, t_scene.roomName+t_scene.sceneName);
        else
            this.addSceneAccessory(uuid, t_scene.sceneID, t_scene.sceneName);
    }
    
}

HC2ScenePlatform.prototype.addSceneAccessory = function(uuid, sceneID, accessoryName) {
    var self = this;
    var accessory;
    
    if (self.accessoryExistByUUID(uuid) == false) {

        self.log('Create New Platform Accessory ' + accessoryName);
        accessory = new Accessory(accessoryName, uuid);
        accessory.context['displayName'] = accessoryName;
        self.api.registerPlatformAccessories(self.pluginName, self.platformName, [accessory]);
        
    } else {
        
        self.log('Update Platform Accessory ' + accessoryName);
        self.api.updatePlatformAccessories(self.accessories[uuid]);
    }
        
    
    self.configureAccessory(accessory);
    
}

HC2ScenePlatform.prototype.accessoryExistByUUID = function(uuid) {
    var self = this;
    for (var key in self.accessories) {
        if (key == uuid) {
            return true;
        }
    }
    return false;
}

HC2ScenePlatform.prototype.configureAccessory = function(accessory) {
    var self = this;
    self.log(accessory.displayName, "Configure Accessory");

/*
    accessory.on('identify', 
        function(paired, callback) {
            self.log(accessory.displayName, "Identify!!!");
            callback();
        });

    // Plugin can save context on accessory
    // To help restore accessory in configureAccessory()
    // newAccessory.context.something = "Something"

    // Make sure you provided a name for service otherwise it may not visible in some HomeKit apps.
    accessory.addService(Service.Lightbulb, accessory.context['displayName'])
                .getCharacteristic(Characteristic.On)
                .on('set', function(value, callback) {
                    self.log('accessory ' + accessoryName +  ' get service characteristic value ' + value);
                    callback();
                });

*/
    self.log(JSON.stringify(self.accessories));
    
    self.accessories[accessory.UUID] = accessory;
}

HC2ScenePlatform.prototype.configurationRequestHandler = function(context, request, callback) {
    this.log(accessory.displayName, "Configure Request Handler");
    
}

HC2ScenePlatform.prototype.removeAccessories = function() {
    var self = this;
    self.log('Remove Platform ' + self.platformName + ' Accessory');
    
    var t_list = [];
    for (var key in self.accessories) {
        t_list.push(self.accessories[key])
    }
    this.log('[DEBUG]', 'accessories to remove ' + t_list);
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, t_list);
    this.accessories = {};
}

HC2ScenePlatform.prototype.getPlatformAccessory = function(uuid) {
    this.log('get Platform Accessory ' + uuid);
}


