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
        log("Platform " + PLATFORM_NAME + " Server Listening...");
    });
    
    if (api) {

        this.api = api;

        this.api.on('didFinishLaunching', this.didFinishLaunching.bind(this));
    }    
}

HC2ScenePlatform.prototype.configureAccessory = function(accessory) {
    var self = this;
    self.log("configure accessory", accessory.displayName );
    
    accessory.reachable = true;
    accessory
    .getService(Service.Switch)
    .getCharacteristic(Characteristic.On)
    .on('set', function(value, callback) {
        self.log(accessory.displayName, "Switch On " + value);
        if (value) {
            self.triggerSceneAccessory(accessory);
        }
        callback();
    })
    .setValue(false);

    accessory.context['sync_exist'] = false;
    self.accessories[accessory.UUID] = accessory;
    
    //self.log('current accessory count ' + Object.keys(self.accessories).length);
    //self.log(accessory.displayName, JSON.stringify(accessory.context));
}

HC2ScenePlatform.prototype.didFinishLaunching = function() {
    var self = this;
    self.log('didFinishLaunching');
    self.log('current configured accessories count ' + Object.keys(self.accessories).length);
    
    self.log('start to read hc2(' + self.config.hc2.hc2_hostname + ') room scenes ...');
    var hc2 = new HC2(self, self.config.hc2);
    hc2.read_hc2_room_scenes(self.syncHC2RoomScenes);
    self.hc2 = hc2;
    setInterval( function() { self.hc2RoomScenesSyncProcess(self); } , 60 * 1000);
}

HC2ScenePlatform.prototype.hc2RoomScenesSyncProcess = function(platfrom) {
    var self = platform;
    self.log('hc2RoomScenesSyncProcess');
    if (!self.hc2) {
        self.hc2.read_hc2_room_scenes(self.syncHC2RoomScenes);
    }
    
}

HC2ScenePlatform.prototype.syncHC2RoomScenes = function(err, response) {
    var self = response.parent;
    var roomScenes = response.roomScenes;

    //-> develop with 2 hc2 scene
    //roomScenes = [roomScenes[0],roomScenes[1]];
    
    if (err != null) {
        self.log('read hc2 room scene err: ' + err.message);
        return;
    }
    
    if (roomScenes.length == 0) {
        self.log('No HC2 Room Scenes Exist!');
        return
    }
    
    self.log('start to add new room scene ...');
    for (var i = 0; i < roomScenes.length; i++) {

        var t_scene = roomScenes[i];
        var accessoryName;
        
        if (t_scene.roomName.charAt(0) != "_") {

            accessoryName = t_scene.roomName + t_scene.sceneName.replace(/\s/g,'');
        } else {

            accessoryName = t_scene.sceneName.replace(/\s/g,'');
        }

        accessoryName = t_scene.sceneName.replace(/\s/g,'');
        if (accessoryName.indexOf('(') > 0 ) {
            accessoryName = accessoryName.substring(0,accessoryName.indexOf('('));
        }

        //self.log('room ' + t_scene.roomName + ', scene ' + t_scene.sceneName + ', accessory ' + accessoryName);
        var accessory = self.addSceneAccessory(t_scene.sceneID, accessoryName);
        accessory.context['sync_exist'] = true;
    }
    
    self.removeNotSyncSceneAccessory();

    self.log('hc2 visible room scene sync completed.');
}

HC2ScenePlatform.prototype.removeNotSyncSceneAccessory = function() {
    var self = this;
    self.log('start to remove scene accessory not in hc2 ...');
    
    for (var uuid in self.accessories) {
        
        var accessory = self.accessories[uuid];
        //self.log(accessory.context.sceneID,accessory.displayName,accessory.context.sync_exist);
        if (accessory.context.sync_exist) {
            //self.log('keep accessory ' + accessory.displayName);
        } else {
            self.log('remove accessory ' + accessory.displayName);
            self.removeAccessory(accessory);
        }
    }
}

HC2ScenePlatform.prototype.triggerSceneAccessory = function(accessory) {
    var self = this;
    var sceneID = accessory.context.sceneID;

    self.log('trigger HC2 scene ' + accessory.displayName + ', id: ' + sceneID);

    var header = { 'host': self.config.hc2.hc2_hostname,
                  'path': '/api/sceneControl?id=' + sceneID + '&action=start',
                    'auth': self.config.hc2.hc2_account + ':' + self.config.hc2.hc2_password
                 };
    
    var request = http.request(
        header, 
        function(response) {
            self.log('response code: ' + response.statusCode);
        }
    );
    request.end();
    
    setTimeout(function(){
        self.resetSceneAccessory(accessory);
    }, 3000);

}

HC2ScenePlatform.prototype.resetSceneAccessory = function(accessory) {
    var self = this;
    self.log('reset hc2 scene accessory id ' + accessory.context.sceneID);

    accessory
    .getService(Service.Switch)
    .getCharacteristic(Characteristic.On)
    .setValue(0);
}

HC2ScenePlatform.prototype.addSceneAccessory = function(sceneID, accessoryName) {
    var self = this;
    var accessory;
    var uuid_sed = accessoryName + sceneID;
    var uuid = UUIDGen.generate(uuid_sed);

    var UUIDs = Object.keys(self.accessories)
    if (UUIDs.indexOf(uuid) == -1) {
        
        var newAccessory = new Accessory(accessoryName, uuid, 8);

        newAccessory.reachable = true;
        newAccessory.context = {sceneID: sceneID};
        newAccessory.addService(Service.Switch, accessoryName)
        .getCharacteristic(Characteristic.On)
        .on('set', function(value, callback) {
            self.log(accessoryName, "Switch On " + value);
            if (value) {
                self.triggerSceneAccessory(newAccessory);
            }
            callback();
        });

        newAccessory
        .getService(Service.AccessoryInformation)
        .setCharacteristic(Characteristic.Manufacturer, "Fibaro")
        .setCharacteristic(Characteristic.Model, "HC2 Scene")
        .setCharacteristic(Characteristic.SerialNumber, uuid);

        this.accessories[uuid] = newAccessory;
        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [newAccessory]);
        self.log('new scene accessory ' + accessoryName + ' added.');
    } else {
        //self.log('scene accessory ' + accessoryName + ' exist, skip.');
    }
    
    return this.accessories[uuid];
}

HC2ScenePlatform.prototype.removeAccessory = function(accessory) {
    var self = this;
    self.log('Remove Accessory ' + accessory.displayName);
    
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


