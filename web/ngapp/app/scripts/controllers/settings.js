'use strict';

angular.module('homeboxApp')
    .controller('SettingsCtrl', 
    ['$http','$scope','SettingsService',
    function($http, $scope, SettingsService) {
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
        
        SettingsService.getSiteConfig().then(
            function(response) {
                var config = response.data;
                var hc2Config = config.hc2;
                var wifiConfig = config.wifi;
                $scope.siteConfig = {
                    hc2IPAddress: hc2Config.hc2_hostname,
                    hc2Account: hc2Config.hc2_account,
                    hc2Password: hc2Config.hc2_password,
                    ssidOptions: config.ssidOptions,
                    ssidSelected: {name: wifiConfig.ssid},
                    wifiPassword: wifiConfig.psk
                };
                $scope.ssidOptions = config.ssidOptions;
                console.log($scope.siteConfig.ssidSelected);
            },function(response){
                $scope.errMessage = 'Fail to get site config data!';
                console.log($scope.errMessage);
                console.log(response.statusText);
            });

        $scope.setSiteConfig = function() {
            SettingsService.setSiteConfig($scope.siteConfig).then(
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
