'use strict';
// TODO: Use a config file for hostname
angular
.module('lucca')
.factory('ZhaoxiangService', function ($http, $q, $timeout, $rootScope){
  var streamPort = 8080;
  var rpi = config.raspberrypi;
  var shouldStream = config.stream;
  var cameras = [];
  var connectedCameras = [];
  var notConnectedCameras = [];
  var promises = [];
  var cancelerTimeout = 5000;

  function init(){
    $rootScope.isLoading = true;

    for (var i = 0; i < rpi.population; i++) {
      var _i = i + 1;
      var digit = (_i.toString().length > 1) ? (_i).toString() : "0" + _i;

      cameras.push({
        index: i,
        digit: digit,
        url: '//' + rpi.basename + digit + '.local:' + rpi.port,
        stream: '//' + rpi.basename + digit + '.local:' + streamPort + '/?action=stream'
      });

      var requestAPI = (config.dev) ? '' : '/api/status';

      cameras[i].defer = $q.defer();
      cameras[i].request = $http
        .get(cameras[i].url + '/api/status', {timeout: cameras[i].defer.promise})
        .success(function (data, status, headers, config){
          var re = new RegExp(rpi.basename + '\(.*\)\.local', 'g');
          var camId = re.exec(config.url)[1];
          connectedCameras.push(cameras[Number(camId) - 1]);

          if(connectedCameras.length + notConnectedCameras.length === rpi.population){
            $rootScope.isLoading = false;
            connectedCameras = _.sortBy(connectedCameras, 'index');
            $rootScope.$emit('ZhaoxiangInitEnded');
          }
        })
        .error(function (data, status, headers, config){
          var re = new RegExp(rpi.basename + '\(.*\)\.local', 'g');
          var camId = re.exec(config.url)[1];
          // notConnectedCameras.push({
          //   digit: camId
          // })
          notConnectedCameras.push(cameras[Number(camId) - 1]);
          notConnectedCameras = _.sortBy(notConnectedCameras, 'index');

          if(connectedCameras.length + notConnectedCameras.length === rpi.population){
            $rootScope.isLoading = false;
            connectedCameras = _.sortBy(connectedCameras, 'index');
            $rootScope.$emit('ZhaoxiangInitEnded');
          }
        });

        (function(i){
          setTimeout(function(){
            cameras[i].defer.resolve();
          }, cancelerTimeout);
        })(i);
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
      for (var i = 0; i < connectedCameras.length; i++) {
        connectedCameras[i].defer = $q.defer()
        connectedCameras[i].request = $http.get(connectedCameras[i].url + '/api/shoot/jpeg', {timeout: connectedCameras[i].defer.promise})
        connectedCameras[i].request
          .success(function (data, status, headers, config){
            if(data.match(/(api\/lastpicture)/)) {
              var re = new RegExp(rpi.basename + '\(.*\)\.local', 'g');
              var camId = re.exec(config.url)[1];
              callback(data, camId);
            } else {
              console.log(data);
            }
          })
          .error(function (data, status, headers, config){
          })
      };
    },
    getCameraAddress: function (index){
      return cameras[Number(index) - 1].url;
    },
    getCameraObject: function(index){
      return cameras[Number(index) - 1];
    },
    getPreview: function(index, callback){
      cameras[Number(index)].defer = $q.defer()
      cameras[Number(index)].request = $http.get(cameras[Number(index)].url + '/api/shoot/jpeg', {timeout: cameras[Number(index)].defer.promise})
      cameras[Number(index)].request
        .success(function (data, status, headers, config){
          if(data.match(/(api\/lastpicture)/)) {
            var re = new RegExp(rpi.basename + '\(.*\)\.local', 'g');
            var camId = re.exec(config.url)[1];
            callback(data, camId);
          } else {
            console.log(data);
          }
        })
        .error(function (data, status, headers, config){
          console.log('nope');
        })
    },
    getPreviousCamera: function(index){
      var id = (Number(index) - 1 < 0) ? rpi.population - 1 : Number(index) - 2;
      return cameras[id];
    },
    getNextCamera: function(index){
      var id = (Number(index) + 1 > rpi.population - 1) ? 0 : Number(index);
      return cameras[id];
    },
    getListOfActiveCameras : function(){
      return cameras;
    },
    getActiveCamera: function(start, direction){
      if (direction === '+1' || direction === '-1'){
        var lastConnectedCam = connectedCameras[connectedCameras.length - 1];
        var firstConnectedCam = connectedCameras[0];
        var index = start + Number(direction);
        var connected;

        if(index < firstConnectedCam.index){
          connected = lastConnectedCam;
        } else if(index > lastConnectedCam.index){
          connected = firstConnectedCam;
        } else {
          connected = _.find(connectedCameras, _.matchesProperty('index', index));
        }
        return connected;
      } else {
        console.error('second parameter needs to be either \'-1\' or \'+1\', depending if you want to go left or right');
        return;
      }
    },
    startStream: function(id){
      if(!shouldStream){
        return 'Streaming not activated';
      }
      $http
        .get('http://' + rpi.basename + id + '.local:1337/api/stream/start')
        .then(function (){
        })
    },
    stopStream: function(id){
      if(!shouldStream){
        return 'Streaming not activated';
      }
      $http
        .get('http://' + rpi.basename + id + '.local:1337/api/stream/stop')
        .then(function (){
        })
    },
    stream: function(){
      return shouldStream;
    }
  }
})
