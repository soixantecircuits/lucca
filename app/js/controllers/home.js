'use strict';

app.controller('HomeCtrl', function ($scope, $location, $http, $rootScope, $q){
  var APIs = [];

  function init(){
    var rpi = config.raspberrypi;

    document.getElementById('getCamTrigger').onclick = function(){
      $scope.killPromises();
      // make sure you don't kill a promise you just instantiate
      setTimeout(function(){
        for (var i = 1; i <= rpi.population; i++) {
          $scope.initCamera(i, '/api/shoot/jpeg');
        }
      }, 10);
    }

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
      span.textContent = '#' + digit;
      img.id = 'camera-' + i;
      img.src = 'img/lucca.png';

      document.getElementById('cameras').appendChild(ctn)
      ctn.appendChild(link);
      link.appendChild(img);
      ctn.appendChild(span);
    };
  }

  $scope.initCamera = function(index, path){
    APIs[index].defer = $q.defer();
    APIs[index].request = $http.get(APIs[index].url + path, {timeout: APIs[index].defer.promise})
    APIs[index].request
        .success(function (res){
          console.log(res);
          if(res.match(/(api\/lastpicture)/)) {
            document.getElementById('camera-' + index).src = APIs[index].url + res
          } else {
            console.log(res);
          }
        })
        .error(function (err){
          document.getElementById('camera-' + index).src = 'img/error.png';
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