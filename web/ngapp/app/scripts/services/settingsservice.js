'use strict';

/**
 * @ngdoc service
 * @name homeboxApp.SettingsService
 * @description
 * # SettingsService
 * Service in the homeboxApp.
 */
angular.module('homeboxApp')
  .constant('apiBaseURL', 'http://flhomebox.local/')
  .service('SettingsService', ['$http','apiBaseURL', 
    function ($http, apiBaseURL) {
        this.getSiteConfig = function() {
            return $http.get(apiBaseURL + '/webapp/api/config');
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
