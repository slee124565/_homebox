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
            ssidOptions: [
                {name: 'SSID1'},
                {name: 'SSID2'},
                {name: 'SSID3'}
            ],
            wifiSSID: {name: 'SSID3'}
        };
        $scope.ssidOptions = $scope.siteConfig.ssidOptions;
        $scope.wifiSSID = $scope.siteConfig.wifiSSID;
        
        $scope.getSiteConfig = function() {
            $http({
                method: 'GET',
                url: '/webapp/api/config'
            }).then(
                function(response) {
                    $scope.siteConfig = JSON.parse(response.data);
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