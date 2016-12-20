'use strict';

/**
 * @ngdoc service
 * @name homeboxApp.SettingsService
 * @description
 * # SettingsService
 * Service in the homeboxApp.
 */
angular.module('homeboxApp')
  .service('SettingsService', ['$http', 
    function ($http) {
        this.getSiteConfig = function() {
            return $http.get('/webapp/api/config/get');
        };
        this.setSiteConfig = function(newConfig) {
            var data = $.param({
                u: newConfig.hc2Account,
                p: newConfig.hc2Password,
                h: newConfig.hc2IPAddress
            });
            return $http.post('/webapp/api/config/post',data);
        };
  }]);
