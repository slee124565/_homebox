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
    
	this.accessories = {}; // uuid -> sceneAccessory

    this.config = config || {};
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
    
    if (api) {

        this.api = api;

        this.api.on('didFinishLaunching', self.didFinishLaunching.bind(this));
    }    
}

HC2ScenePlatform.prototype.configureAccessory = function(accessory) {
    var self = this;
    self.log(accessory.displayName, "Configure Accessory");
    
    accessory.reachable = true;
    accessory
    .getService(Service.Switch)
    .getCharacteristic(Characteristic.On)
    .setValue(0);
    
    self.accessories[accessory.UUID] = accessory;

}

HC2ScenePlatform.prototype.didFinishLaunching = function() {
    var self = this;
    this.log('didFinishLaunching');
    
    var hc2 = new HC2();
    var roomScenes = hc2.get_visible_room_scenes();
    
    //-> develop with 2 hc2 scene
    roomScenes = [roomScenes[0],roomScenes[1]];
    
    if (roomScenes.length == 0) {
        this.log('No HC2 Room Scenes Exist!');
        return
    }
    
    for (var i = 0; i < roomScenes.length; i++) {

        var t_scene = roomScenes[i];
        var accessoryName = t_scene.roomName + t_scene.sceneName;

        if (t_scene.roomName.charAt(0) != "_")
            this.addSceneAccessory(t_scene.sceneID, t_scene.roomName+t_scene.sceneName);
        else
            this.addSceneAccessory(t_scene.sceneID, t_scene.sceneName);
    }

}

HC2ScenePlatform.prototype.hc2SceneEventWithAccessory = function(accessory) {
    var targetChar = accessory
    .getService(Service.StatelessProgrammableSwitch)
    .getCharacteristic(Characteristic.ProgrammableSwitchEvent);

    targetChar.setValue(1);
    setTimeout(function(){targetChar.setValue(0);}, 10000);

}

HC2ScenePlatform.prototype.addSceneAccessory = function(sceneID, accessoryName) {
    var self = this;
    var accessory;
    var uuid_sed = accessoryName + t_scene.sceneID;
    var uuid = UUIDGen.generate(uuid_sed);

    var newAccessory = new Accessory(name, uuid, 15);

    newAccessory.reachable = true;
    newAccessory.context.mac = mac;
    newAccessory.addService(Service.Switch, name);
    newAccessory
    .getService(Service.AccessoryInformation)
    .setCharacteristic(Characteristic.Manufacturer, "Fibaro")
    .setCharacteristic(Characteristic.Model, "HC2 Scene")
    .setCharacteristic(Characteristic.SerialNumber, uuid)
    .getCharacteristic(Characteristic.On)
    .on('set', function(value, callback) {
        self.log(accessory.displayName, "Switch On " + value);
        callback();
    });
    
    this.accessories[uuid] = newAccessory;
    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [newAccessory]);

}

HC2ScenePlatform.prototype.removeAccessory = function(accessory) {
    var self = this;
    self.log('Remove Accessory ' + accessories.displayName);
    
    if (accessory) {
        var uuid = accessory.UUID;
        this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
        delete this.accessories[uuid];
    }
}

HC2ScenePlatform.prototype.removeAccessories = function() {
    var self = this;
    self.log('Remove Platform ' + self.platformName + ' Accessory');
    
    var t_list = [];
    for (var key in self.accessories) {
        t_list.push(self.accessories[key])
    }
    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, t_list);
    this.accessories = {};
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

HC2ScenePlatform.prototype.configurationRequestHandler = function(context, request, callback) {
    this.log(accessory.displayName, "Configure Request Handler");
    
}

HC2ScenePlatform.prototype.getPlatformAccessory = function(uuid) {
    this.log('get Platform Accessory ' + uuid);
}


