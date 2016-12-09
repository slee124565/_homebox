'use strict';

var data = {
    a: 'valuea',
    b: 'valueb'
}

var t_list = []
for (var key in data) {
    t_list.push(data[key]);
}
console.log(t_list);