'use strict';

app.controller('CamCtrl', function ($scope, $rootScope, $location, $routeParams, $http, ZhaoxiangService, $templateCache, hotkeys){
  $templateCache.removeAll();
  $scope.params = $routeParams;
  $scope.ghostmode = false;
  $scope.isStreaming = false;
  $scope.camera = ZhaoxiangService.getCameraObject($scope.params.id);
  $scope.stream = ZhaoxiangService.stream();
  $scope.prev;
  $scope.next;
  $scope.isDeconnected = false;

  function init(){
    if(config.dev){
      $scope.camera.url = 'img/data/output_000' + $scope.params.id + '.jpg';
      // $scope.camera.url = 'http://lorempixel.com/720/480' + '?q=' + new Date().getTime();
      $scope.prev = ZhaoxiangService.getPreviousCamera($scope.params.id);
      $scope.next = ZhaoxiangService.getNextCamera($scope.params.id);
    } else {
      $scope.prev = ZhaoxiangService.getActiveCamera($scope.camera.index, '-1');
      $scope.next = ZhaoxiangService.getActiveCamera($scope.camera.index, '+1');
    }

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
  }

  if($scope.isLoading){
    $rootScope.$on('ZhaoxiangInitEnded', function(){
      init();
    });
  } else {
    init();
  }

  if($scope.stream){
    $scope.cvs = document.getElementById('cvs');
    $scope.ctx = cvs.getContext('2d');
    $scope.cvs.width = 716;
    $scope.cvs.height = 477;
  }

  $scope.img = document.getElementById('camera');
  if(config.dev){
    $scope.img.src = $scope.camera.url;
  }else{
    $scope.img.src = $scope.camera.url + '/api/lastpicture/jpeg';
  }

  $scope.$on('$destroy', function(){
    if($scope.stream){
      ZhaoxiangService.stopStream($scope.camera.digit);
      if($scope.ghostmode){
        ZhaoxiangService.stopStream($scope.prev.digit);
      }
    }
  });

  $scope.toggleStreaming = function(){
    if($scope.stream){
      if($scope.isStreaming){
        ZhaoxiangService.startStream($scope.camera.digit);
        $scope.img.src = $scope.camera.stream;
      } else {
        ZhaoxiangService.stopStream($scope.camera.digit);
        $scope.img.src = $scope.camera.url + '/api/lastpicture/jpeg';
      }
    }
  }

  $scope.toggleGhostmode = function(){
    if($scope.stream){
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
    } else {
      if(config.dev){
        var prevID = ($scope.params.id - 1 < 10) ? '0' + Number($scope.params.id - 1).toString() : ($scope.params.id - 1);
        document.getElementById('ghost').src = 'img/data/output_000' + prevID + '.jpg';
        // document.getElementById('ghost').src = 'http://lorempixel.com/720/480' + '?q=' + new Date().getTime();
      }else{
        document.getElementById('ghost').src = $scope.prev.url + '/api/lastpicture/jpeg?q=' + new Date().getTime();
      }
    }
  }

  $scope.shootPreview = function(){
    ZhaoxiangService.getPreview($scope.camera.index, function (picture){
      $scope.img.src = $scope.camera.url + picture + '?q=' + new Date().getTime();
    });
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
  var settings = $scope.gphoto.displaySettings('http://voldenuit' + $scope.params.id + '.local:1337');

  $scope.photo = {number: $scope.params.id,
    rotation:0,
    translateX:0,
    translateY:0
  };
  $scope.setRotation = function(){
    $('#camera-img-ctn > #camera').css({
      'webkitTransform': 'rotate('+this.photo.rotation+'deg) translateX('+this.photo.translateX+'px) translateY('+this.photo.translateY+'px)'
    });
  }
  $scope.setTranslationX = function(){
    $('#camera-img-ctn > #camera').css({
      'webkitTransform': 'rotate('+this.photo.rotation+'deg) translateX('+this.photo.translateX+'px) translateY('+this.photo.translateY+'px)'
    });
  }
  $scope.setTranslationY = function(){
    $('#camera-img-ctn > #camera').css({
      'webkitTransform': 'rotate('+this.photo.rotation+'deg) translateX('+this.photo.translateX+'px) translateY('+this.photo.translateY+'px)'
    });
  }

  $scope.sendAlignment = function(){
    $http
      .get(config.nuwa.address + ':' + config.nuwa.port + '/api/params/' + $scope.photo.number + '/' + $scope.photo.hello + '/' + $scope.photo.translateX + '/' + $scope.photo.translateY)
      .then(function (res){
        console.log(res);
      })
  }

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
