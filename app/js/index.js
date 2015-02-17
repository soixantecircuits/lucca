'use strict';
/**
* @ngdoc overview
* @name yourAppNameApp
* @description
* # yourAppNameApp
*
* Main module of the application.
*/
var app = angular
  .module('lucca', [
    'ngRoute',
    'ngTouch',
  ]);

app.config(function ($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/home.html',
    controller: 'HomeCtrl'
  })
  .when('/cam/:id', {
    templateUrl: 'views/camera.html',
    controller: 'CamCtrl'
  })
  .otherwise({
    redirectTo: '/'
  });
});