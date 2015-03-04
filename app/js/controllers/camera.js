'use strict';

app.controller('CamCtrl', function ($scope, $location, $routeParams, $http, ZhaoxiangService, $templateCache){
  $templateCache.removeAll();
  $scope.params = $routeParams;
  $scope.ghostmode = false;
  $scope.isStreaming = false;
  $scope.camera = ZhaoxiangService.getCameraObject($scope.params.id);
  $scope.prev;
  ZhaoxiangService.getPreviousActiveCamera($scope.camera.index, function (prev){
    $scope.prev = prev;
    $scope.$apply();
  });
  $scope.next;
  ZhaoxiangService.getNextActiveCamera($scope.camera.index, function (next){
    $scope.next = next;
    $scope.$apply();
  });

  $scope.cvs = document.getElementById('cvs');
  $scope.ctx = cvs.getContext('2d');
  $scope.cvs.width = 716;
  $scope.cvs.height = 477;

  $scope.img = document.getElementById('camera');
  $scope.img.src = $scope.camera.url + '/api/lastpicture/jpeg';
  // $scope.img.src = camera.stream;

  // var prevCamera = ZhaoxiangService.getPreviousCamera($scope.params.id);
  // $scope.imgPrev = new Image();
  // $scope.imgPrev.id = 'prevCamera';
  // $scope.imgPrev.src = 'http://voldenuit' + $scope.prevDigit + '.local:8080/?action=stream';
  // $scope.imgPrev.style.display = 'none';
  // document.body.appendChild($scope.imgPrev);

  $scope.toggleStreaming = function(){
    if($scope.isStreaming){
      $scope.img.src = $scope.camera.stream;
    } else {
      $scope.img.src = $scope.camera.url + '/api/lastpicture/jpeg';
    }
  }

  $scope.loop = function(){
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
    }
    $scope.ctx.drawImage($scope.img, 0, 0, $scope.cvs.width, $scope.cvs.height);
  }

  // $http.get('http://voldenuit' + $scope.params.id + '.local:1337/api/stream/start');
  // $scope.imgSrc = 'http://voldenuit' + $scope.params.id + '.local:8080/?action=stream';

  $scope.$on('$destroy', function(){
    $http.get('http://voldenuit' + $scope.params.id + '.local:1337/api/stream/stop');
  });

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