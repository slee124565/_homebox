'use strict';

var http = require('http');

module.exports = HC2;

function HC2(parent, config) {
    this.parent = parent;
    this.log = parent.log;
    this.config = config || {};
    this.hc2_rooms = {};
    this.hc2_scenes = {};

    this.log('hc2 module', 
             this.config.hc2_account,
             this.config.hc2_password,
             this.config.hc2_hostname
            );
}

HC2.prototype.get_scenes = function() {
    
    var hc2_scenes = require('./hc2_scenes.json');
    return hc2_scenes;
}

HC2.prototype.get_rooms = function() {
    
    var hc2_rooms = require('./hc2_rooms.json');
    
    return hc2_rooms;
}

HC2.prototype.get_visible_room_scenes = function() {
    var self = this
    var room_scenes = [];
    
    var hc2_scenes = self.hc2_scenes; //this.get_scenes();
    var hc2_rooms = self.hc2_rooms; // this.get_rooms();
    
    for (var i=0; i < hc2_scenes.length; i++) {
        
        var t_scene = hc2_scenes[i];
        if (t_scene['visible'] && t_scene['roomID'] > 0) {
            var roomID = t_scene.roomID;
            var roomName = undefined;
            for (var j =0; j < hc2_rooms.length; j++) {
                var t_room = hc2_rooms[j];
                if (t_room.id == roomID) {
                    roomName = t_room.name;
                    break;
                }
            }
            
            if (roomName != undefined) {
                room_scenes.push({
                    sceneID: t_scene.id,
                    sceneName: t_scene.name,
                    roomName: roomName
                });
                //console.log(JSON.stringify({sceneID: t_scene.id,sceneName: t_scene.name,roomName: roomName}));
            }
        }
    }

    return room_scenes;
}

HC2.prototype.read_hc2_room_scenes = function(callback) {
    var self = this;
    self.log('read hc2 scenes ...');
    
    var header = { 
        'host': self.config.hc2_hostname,
        'path': '/api/scenes',
        'auth': self.config.hc2_account + ':' + self.config.hc2_password
    };
    
    var request = http.request(
        header, 
        function(response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end', function () {
                self.hc2_scenes = JSON.parse(str);
                self.log('read hc2 scenes count ' + self.hc2_scenes.length);
                self.read_hc2_rooms(callback);
            });
            
            response.on('error', function (err) {
                self.log('read hc2 scenes error: ' + err.message);
                callback(err,null);
            });

            self.log('read hc2 scenes response code: ' + response.statusCode);
        }
    );
    request.end();
    
}

HC2.prototype.read_hc2_rooms = function(callback) {
    var self = this;
    var room_scenes = [];
    
    self.log('read hc2 rooms ...');
    
    var header = { 
        'host': self.config.hc2_hostname,
        'path': '/api/rooms',
        'auth': self.config.hc2_account + ':' + self.config.hc2_password
    };
    
    var request = http.request(
        header, 
        function(response) {
            var str = '';
            response.on('data', function (chunk) {
                str += chunk;
            });

            //the whole response has been recieved, so we just print it out here
            response.on('end', function () {
                self.hc2_rooms = JSON.parse(str);
                self.log('read hc2 rooms count ' + self.hc2_rooms.length);
                callback(null, { 
                    parent: self.parent,
                    roomScenes : self.get_visible_room_scenes()});
            });
            
            response.on('error', function (err) {
                self.log('read hc2 rooms error: ' + err.message);
                callback(err,null);
            });

            self.log('read hc2 rooms response code: ' + response.statusCode);
        }
    );
    request.end();
}

