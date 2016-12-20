'use strict';

/**
 * @ngdoc overview
 * @name homeboxApp
 * @description
 * # homeboxApp
 *
 * Main module of the application.
 */
angular
  .module('homeboxApp', [
    'ngResource',
    'ui.router'
  ]).config(function($stateProvider, $urlRouterProvider){
    $stateProvider
    .state({
        name: 'settings',
        url: '/settings',
        templateUrl: 'views/settings.html',
        controller: 'SettingsCtrl'
    });
    
    $urlRouterProvider.otherwise('/settings');
});
