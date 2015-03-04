'use strict';

angular
.module('lucca')
.factory('ZhaoxiangService', function ($http, $q, $timeout, $rootScope){
  var rpi = config.raspberrypi;
  var cameras = [];
  var connectedCameras = [];
  var notConnectedCameras = [];
  var promises = [];

  function init(){
    $rootScope.isLoading = true;

    for (var i = 0; i < rpi.population; i++) {
      var _i = i + 1;
      var digit = (_i.toString().length > 1) ? (_i).toString() : "0" + _i;

      cameras.push({
        index: i,
        digit: digit,
        url: '//' + rpi.basename + digit + '.local:' + rpi.port,
        stream: '//' + rpi.basename + digit + '.local:8080/?action=stream'
      })
    };

    for (var i = 0; i < rpi.population; i++) {
      cameras[i].defer = $q.defer()
      cameras[i].request = $http.get(cameras[i].url + '/api/status', {timeout: cameras[i].defer.promise})
      cameras[i].request
        .success(function (data, status, headers, config){
          var camId = config.url.match(/voldenuit(.*)\.local/)[1];
          connectedCameras.push(cameras[+camId - 1]);
          if(+camId === rpi.population){
            $rootScope.isLoading = false;
          }
        })
        .error(function (data, status, headers, config){
          var camId = config.url.match(/voldenuit(.*)\.local/)[1];
          notConnectedCameras.push({
            id: camId
          });
          if(+camId === rpi.population){
            $rootScope.isLoading = false;
          }
        })
    }
  }

  init();

  return {
    doActionForAll: function(cb){
      for (var i = 0; i < rpi.population; i++) {
        cb(cameras[i]);
      };
    },
    getAllStatus: function(){
      return {
        connected: connectedCameras,
        notConnected: notConnectedCameras
      };
    },
    getAllPreviews: function (callback){
      $rootScope.isLoading = true;
      for (var i = 0; i < connectedCameras.length; i++) {
        connectedCameras[i].defer = $q.defer()
        connectedCameras[i].request = $http.get(connectedCameras[i].url + '/api/shoot/jpeg', {timeout: connectedCameras[i].defer.promise})
        connectedCameras[i].request
          .success(function (data, status, headers, config){
            $rootScope.isLoading = false;
            if(data.match(/(api\/lastpicture)/)) {
              var camId = config.url.match(/voldenuit(.*)\.local/)[1];
              callback(data, camId);
            } else {
              console.log(data);
            }
          })
          .error(function (data, status, headers, config){
            $rootScope.isLoading = false;
          })
      };
    },
    getCameraAddress: function (index){
      return cameras[+index - 1].url;
    },
    getCameraObject: function(index){
      return cameras[+index - 1];
    },
    getPreviousCamera: function(index){
      var id = (+index - 1 < 0) ? rpi.population - 1 : +index - 1;
      return cameras[id];
    },
    getNextCamera: function(index){
      var id = (+index + 1 > rpi.population - 1) ? 0 : +index + 1;
      return cameras[id];
    },
    getPreviousActiveCamera: function(index, callback){
      $rootScope.isLoading = true;
      var id = (+index - 1 < 0) ? connectedCameras.length : +index - 1;
      var prev = _.find(connectedCameras, _.matchesProperty('url', cameras[id].url));
      if(prev !== undefined){
        $rootScope.isLoading = false;
        callback(prev, false);
      } else {
        var time = (connectedCameras.length) ? 10 : 1500;
        $timeout(function(){
          for (var i = id, len = -1; i >= len; i--) {
            prev = _.find(connectedCameras, _.matchesProperty('url', cameras[i].url));
            if(prev !== undefined){
              $rootScope.isLoading  = false;
              callback(prev, true);
              break;
            }
            if(i === 0){
              len = i;
              i = connectedCameras.length;
            }
          };
        }, time);
      }
    },
    getNextActiveCamera: function(index, callback){
      $rootScope.isLoading = true;
      var id = (+index + 1 > connectedCameras.length - 1) ? 0 : +index + 1;
      var next = _.find(connectedCameras, _.matchesProperty('url', cameras[id].url));
      if(next !== undefined){
        $rootScope.isLoading = false;
        callback(next, false);
      } else {
        var time = (connectedCameras.length) ? 10 : 1500;
        $timeout(function(){
          for (var i = id, len = connectedCameras.length; i <= len; i++) {
            next = _.find(connectedCameras, _.matchesProperty('url', cameras[id].url));
            if(next !== undefined){
              $rootScope.isLoading = false;
              callback(next, true);
              break;
            }
            if(i === len){
              len = i;
              i = 0;
            }
          };
        }, time);
      }
    },
    startStream: function(id){
      $rootScope.isLoading = true;
      $http
        .get('http://voldenuit' + id + '.local:1337/api/stream/start')
        .then(function (){
          $rootScope.isLoading = false;
        })
    },
    stopStream: function(id){
      $rootScope.isLoading = true;
      $http
        .get('http://voldenuit' + id + '.local:1337/api/stream/stop')
        .then(function (){
          $rootScope.isLoading = false;
        })
    }
  };

})