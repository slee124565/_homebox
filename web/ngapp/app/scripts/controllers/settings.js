'use strict';

angular.module('homeboxApp')
    .controller('SettingsCtrl', 
    ['$http','$scope',
    function($http, $scope) {
        $scope.title = 'FLH Homebox';
        $scope.description = 'Make your Fibaro HC2/HCL connected with Homekit APP';
        $scope.header = 'System Configurations';
        
        $scope.siteConfig = {
            hc2IPAddress: '',
            hc2Account: '',
            hc2Password: '',
            ssidOptions: [],
            wifiSSID: {}
        };
        $scope.ssidOptions = $scope.siteConfig.ssidOptions;
        $scope.wifiSSID = $scope.siteConfig.wifiSSID;
        $scope.getSiteConfig();
        
        $scope.getSiteConfig = function() {
            $http({
                method: 'GET',
                url: '/webapp/api/config'
            }).then(
                function(response) {
                    $scope.config = JSON.parse(response.data);
                    $scope.siteConfig = {
                        hc2IPAddress: config.hc2.hc2_hostname,
                        hc2Account: config.hc2.hc2_account,
                        hc2Password: config.hc2.hc2_password,
                        ssidOptions: config.ssidOptions,
                        wifiSSID: {name: config.wifi.ssid},
                        wifiPass: config.wifi.psk
                    };
                    $scope.ssidOptions = $scope.siteConfig.ssidOptions;
                    $scope.wifiSSID = $scope.siteConfig.wifiSSID;
                    $scope.wifiPassword = $scope.siteConfig.wifiPass;
                },function(response){
                    $scope.errMessage = 'Fail to get site config data!';
                    console.log($scope.errMessage);
                    console.log(response.statusText);
                });
        };
        $scope.setSiteConfig = function() {
            $http({
                method: 'POST',
                url: '/webapp/api/config',
                data: $scope.siteConfig,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(
                function(response){
                    $scope.notifyMessage = response.data;
                    console.log($scope.notifyMessage);
                }, function(response){
                    $scope.errMessage = 'Fail to save site config data!';
                    console.log($scope.errMessage);
                    console.log(response.statusText);
                });
        };
        
    }]);