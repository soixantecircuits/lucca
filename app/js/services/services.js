'use strict';

angular
.module('lucca')
.factory('ZhaoxiangService', function ($http, $q, $timeout){
  var rpi = config.raspberrypi;
  var cameras = [];
  var connectedCameras = [];
  var notConnectedCameras = [];
  var promises = [];

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
      })
      .error(function (data, status, headers, config){
        var camId = config.url.match(/voldenuit(.*)\.local/)[1];
        notConnectedCameras.push({
          id: camId
        });
      })
  }

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
      for (var i = 0; i < connectedCameras.length; i++) {
        connectedCameras[i].defer = $q.defer()
        connectedCameras[i].request = $http.get(connectedCameras[i].url + '/api/shoot/jpeg', {timeout: connectedCameras[i].defer.promise})
        connectedCameras[i].request
          .success(function (data, status, headers, config){
            if(data.match(/(api\/lastpicture)/)) {
              var camId = config.url.match(/voldenuit(.*)\.local/)[1];
              callback(data, camId);
            } else {
              console.log(data);
            }
          })
          .error(function (data, status, headers, config){})
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
      var time = (connectedCameras.length) ? 500 : 1500;
      $timeout(function(){
        var id = (+index - 1 < 0) ? connectedCameras.length : +index - 1;
        var prev;
        for (var i = id, len = -1; i >= len; i--) {
          prev = _.find(connectedCameras, _.matchesProperty('url', cameras[i].url));
          if(prev !== undefined){
            callback(prev);
            break;
          }
          if(i === 0){
            len = i;
            i = connectedCameras.length;
          }
        };
      }, time);
    },
    getNextActiveCamera: function(index, callback){
      var time = (connectedCameras.length) ? 500 : 1500;
      $timeout(function(){
        var id = (+index + 1 > connectedCameras.length - 1) ? 0 : +index + 1;
        var next;
        for (var i = id, len = connectedCameras.length; i <= len; i++) {
          next = _.find(connectedCameras, _.matchesProperty('url', cameras[i].url));
          console.log(i, cameras[i].url, next);
          if(next !== undefined){
            callback(next);
            break;
          }
          if(i === len){
            len = i;
            i = 0;
          }
        };
      }, time);
    },
    getPreviousStream: function(index){
      // var prevId = (_i - 1 < 0) ? config.raspberrypi.population : _i - 1;
      // var prevDigit = (prevId.toString().length > 1) ? $scope.prevId.toString() : "0" + prevId;
    },
  };

})