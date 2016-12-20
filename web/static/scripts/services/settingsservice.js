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
            return $http.get('/webapp/api/config');
        };
        this.setSiteConfig = function(newConfig) {
            return $http({
                method: 'POST',
                url: '/webapp/api/config',
                data: newConfig,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });
        };
  }]);
