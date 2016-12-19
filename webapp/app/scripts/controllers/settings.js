'use strict';

angular.module('homeboxApp')
    .controller('SettingsCtrl', 
    ['$scope',
    function($scope) {
        $scope.site = {
            title: 'FLH Homebox',
            description: 'Make your Fibaro HC2/HCL connected with Homekit APP',
            header: 'System Configurations',
            ssidOptions: [
                {id:'SSID1', name: 'SSID1'},
                {id:'SSID2', name: 'SSID2'},
                {id:'SSID3', name: 'SSID3'}
            ],
            selectedSSID: {id:'SSID2', name: 'SSID2'}
        };
    }]);