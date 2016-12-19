'use strict';

angular.module('homeboxApp')
    .controller('SettingsCtrl', 
    ['$scope',
    function($scope) {
        $scope.title = 'FLH Homebox';
        $scope.description = 'Make your Fibaro HC2/HCL connected with Homekit APP';
        $scope.header = 'System Configurations';

        $scope.siteConfig = {
            hc2IPAddress: '',
            hc2Account: '',
            hc2Password: '',
            ssidOptions: [
                {id:'SSID1', name: 'SSID1'},
                {id:'SSID2', name: 'SSID2'},
                {id:'SSID3', name: 'SSID3'}
            ],
            selectedSSID: {id:'SSID2', name: 'SSID2'}
        };
        
    }]);