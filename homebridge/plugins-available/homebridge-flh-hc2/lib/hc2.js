'use strict';

module.exports = HC2;

function HC2() {

    console.log('load module HC2');
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
    var room_scenes = [];
    
    var hc2_scenes = this.get_scenes();
    var hc2_rooms = this.get_rooms();
    
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
                console.log(JSON.stringify({
                    sceneID: t_scene.id,
                    sceneName: t_scene.name,
                    roomName: roomName
                }));
            }
        }
    }

    return room_scenes;
}