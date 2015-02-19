'use strict';

app.controller('HomeCtrl', function ($scope, $rootScope, $location, $http, $q){
  var APIs = [];
  $scope.requesting = false;
  $rootScope.availableCameras = [];

  var rpi = config.raspberrypi;

  function init(){

    for (var i = 1; i <= rpi.population; i++) {
      var digit = (i.toString().length > 1) ? i.toString() : "0" + i;
      APIs[i] = {
        url: 'http://' + rpi.basename + digit + '.local:' + rpi.port
      }

      var ctn = document.createElement('div');
      var link = document.createElement('a');
      var span = document.createElement('span');
      var img = document.createElement('img');

      link.href = '#/cam/' + digit;
      link.className = 'camera-list'
      span.textContent = '#' + digit;
      img.id = 'camera-' + i;
      // img.src = 'img/lucca.png';

      document.getElementById('cameras').appendChild(ctn)
      ctn.appendChild(link);
      link.appendChild(img);
      ctn.appendChild(span);
    };
  }

  $scope.getStatus = function(){
    $scope.requesting = true;
    $scope.killPromises();
    // make sure you don't kill a promise you just instantiate
    setTimeout(function(){
      for (var i = 1; i <= rpi.population; i++) {
        $scope.getCameraStatus(i, '/api/status');
      }
      $scope.requesting = false;
    }, 10);
  }

  $scope.getCameraStatus = function(index, path){
    $rootScope.availableCameras = [];
    APIs[index].defer = $q.defer();
    APIs[index].request = $http.get(APIs[index].url + path, {timeout: APIs[index].defer.promise})
    APIs[index].request
        .success(function (res, status, headers, config){
          console.log(res);
          $rootScope.availableCameras.push({
            url: config.url.match(/(?:http:\/\/[A-Za-z0-9-]+\.)+[A-Za-z0-9]{1,5}:\d{1,5}/)[0],
            id: index
          });
          document.getElementById('camera-' + index).parentElement.parentElement.classList.add('is-connected');
        })
        .error(function (err){
          document.getElementById('camera-' + index).parentElement.parentElement.classList.add('is-not-connected');
        });
  }

  $scope.getPreview = function(){
    $scope.requesting = true;
    $scope.killPromises();
    // make sure you don't kill a promise you just instantiate
    setTimeout(function(){
      for (var i = 0; i < $rootScope.availableCameras.length; i++) {
        $scope.getCameraPreview(i, '/api/shoot/jpeg');
      }
      $scope.requesting = false;
    }, 10);
  }

  $scope.getCameraPreview = function(index, path){
    $rootScope.availableCameras[index].defer = $q.defer();
    $rootScope.availableCameras[index].request = $http.get($rootScope.availableCameras[index].url + path, {timeout: $rootScope.availableCameras[index].defer.promise})
    $rootScope.availableCameras[index].request
        .success(function (res, status, headers, config){
          console.log(res);
          if(res.match(/(api\/lastpicture)/)) {
            var domElement = document.getElementById('camera-' + $rootScope.availableCameras[index].id);
            domElement.parentElement.parentElement.classList.add('has-preview');
            domElement.src = $rootScope.availableCameras[index].url + res
          } else {
            console.log(res);
          }
        })
        .error(function (err){
          document.getElementById('camera-' + index).parentElement.parentElement.classList.add('is-not-connected');
        });
  }

  init();

  $scope.$on('$destroy', function(){
    $scope.killPromises();
  })

  $scope.killPromises = function(){
    for (var i = 1; i <= config.raspberrypi.population; i++) {
      if(APIs[i].request){
        APIs[i].defer.resolve();
      }
    }
  }
});