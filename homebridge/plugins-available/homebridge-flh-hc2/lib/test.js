'use strict';

var HC2 = require('./hc2');
var hc2 = new HC2();
var room_scenes = hc2.get_visible_room_scenes();
for (var i = 0; i < room_scenes.length; i++) {
    var t_scene = room_scenes[i];
    console.log(t_scene.sceneID, t_scene.sceneName, t_scene.roomName);
}