'use strict';

var HC2 = require('./hc2')
var hc2 = new HC2(console.log, {
    hc2_account: 'admin',
    hc2_password: 'flhadmin',
    hc2_hostname: '192.168.10.5'
});

hc2.read_hc2_room_scenes(function(err,roomScenes){
    console.log('total room scenes ' + roomScenes.length);
    console.log(roomScenes);
});
