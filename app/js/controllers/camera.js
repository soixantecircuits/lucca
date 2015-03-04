'use strict';

app.controller('CamCtrl', function ($scope, $rootScope, $location, $routeParams, $http, ZhaoxiangService, $templateCache, hotkeys){
  $templateCache.removeAll();
  $scope.params = $routeParams;
  $scope.ghostmode = false;
  $scope.isStreaming = false;
  $scope.camera = ZhaoxiangService.getCameraObject($scope.params.id);
  $scope.prev;
  ZhaoxiangService.getPreviousActiveCamera($scope.camera.index, function (prev, async){
    $scope.prev = prev;
    if(async){
      $scope.$apply();
    }
  });
  $scope.next;
  ZhaoxiangService.getNextActiveCamera($scope.camera.index, function (next, async){
    $scope.next = next;
    if(async){
      $scope.$apply();
    }
  });

  hotkeys.bindTo($scope)
    .add({
      combo: 'left',
      callback: function(){
        if(!$rootScope.isLoading){
          window.location = '#/cam/' + $scope.prev.digit;
        }
      }
    })
    .add({
      combo: 'right',
      callback: function(){
        if(!$rootScope.isLoading){
          window.location = '#/cam/' + $scope.next.digit;
        }
      }
    });

  $scope.cvs = document.getElementById('cvs');
  $scope.ctx = cvs.getContext('2d');
  $scope.cvs.width = 716;
  $scope.cvs.height = 477;

  $scope.img = document.getElementById('camera');
  $scope.img.src = $scope.camera.url + '/api/lastpicture/jpeg';

  $scope.$on('$destroy', function(){
    ZhaoxiangService.stopStream($scope.camera.digit);
    if($scope.ghostmode){
      ZhaoxiangService.stopStream($scope.prev.digit);
    }
  });

  $scope.toggleStreaming = function(){
    if($scope.isStreaming){
      ZhaoxiangService.startStream($scope.camera.digit);
      $scope.img.src = $scope.camera.stream;
    } else {
      ZhaoxiangService.stopStream($scope.camera.digit);
      $scope.img.src = $scope.camera.url + '/api/lastpicture/jpeg';
    }
  }

  $scope.toggleGhostmode = function(){
    if(!$scope.isStreaming){
      $scope.isStreaming = true;
      $scope.toggleStreaming();
    }
    if($scope.ghostmode){
      ZhaoxiangService.startStream($scope.prev.digit);
      $scope.imgPrev = new Image();
      $scope.imgPrev.src = $scope.prev.stream;
      $scope.imgPrev.style.display = 'none';
      document.body.appendChild($scope.imgPrev);
      loop();
    } else {
      ZhaoxiangService.stopStream($scope.prev.digit);
      document.body.removeChild($scope.imgPrev);
    }
  }

  function loop(){
    if($scope.isStreaming){
      requestAnimationFrame(loop);
      render();
    }
  }

  function render(){
    if($scope.ghostmode){
      $scope.ctx.clearRect(0, 0, $scope.cvs.width, $scope.cvs.height);
      $scope.ctx.globalAlpha = 1;
      $scope.ctx.drawImage($scope.imgPrev, 0, 0, $scope.cvs.width, $scope.cvs.height);
      $scope.ctx.globalAlpha = 0.75;
      $scope.ctx.drawImage($scope.img, 0, 0, $scope.cvs.width, $scope.cvs.height);
    }
  }

  $scope.gphoto = new GPhoto();
  $scope.gphoto.displaySettings('http://voldenuit' + $scope.params.id + '.local:1337');

  $scope.sendSettingsToAll = function(){
    if(confirm('This will apply these settings to all cameras, thus potentially freeze them all.\nAre you sure of what you are doing ?')){
      if(confirm('If you mess up, we will find you.\nDo you still want to continue ?')){
        var settings = null;
        $http
          .get('http://voldenuit' + $scope.params.id + '.local:1337/api/settings')
          .success(function (data){
            settings = data;

            var rpi = config.raspberrypi;
            for (var i = 1; i <= rpi.population; i++) {
              var digit = (i.toString().length > 1) ? i.toString() : "0" + i;
              var url = 'http://' + rpi.basename + digit + '.local:' + rpi.port;
              $http.put(url + '/api/settings', {settings: JSON.stringify(settings)})
                .success(function (res){
                  console.log(res);
                })
                .error(function (err){
                  console.log(err);
                })
            }
          })
          .error(function (err){
            console.log(err);
          })
      }
    }
  }
});