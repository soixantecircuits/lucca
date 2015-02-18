'use strict';

app.controller('CamCtrl', function ($scope, $location, $routeParams, $http){
  $scope.params = $routeParams;
  $scope.ghostmode = false;

  $scope.prevId = ($scope.params.id - 1 < 0) ? config.raspberrypi.population : $scope.params.id - 1;
  $scope.prevDigit = ($scope.prevId.toString().length > 1) ? $scope.prevId.toString() : "0" + $scope.prevId;

  $scope.nextId = ($scope.params.id + 1 > config.raspberrypi.population) ? 1 : +$scope.params.id + 1;
  $scope.nextDigit = ($scope.nextId.toString().length > 1) ? $scope.nextId.toString() : "0" + $scope.nextId;

  $scope.cvs = document.getElementById('cvs');
  $scope.ctx = cvs.getContext('2d');
  $scope.cvs.width = 716;
  $scope.cvs.height = 477;

  $scope.img = document.getElementById('camera');
  $scope.img.src = 'http://voldenuit' + $scope.params.id + '.local:8080/?action=stream';

  $scope.imgPrev = new Image();
  $scope.imgPrev.id = 'prevCamera';
  $scope.imgPrev.src = 'http://voldenuit' + $scope.prevDigit + '.local:8080/?action=stream';
  $scope.imgPrev.style.display = 'none';
  document.body.appendChild($scope.imgPrev);

  function loop(){
    requestAnimationFrame(loop);
    render();
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

  $http.get('http://voldenuit' + $scope.params.id + '.local:1337/api/stream/start');
  $scope.imgSrc = 'http://voldenuit' + $scope.params.id + '.local:8080/?action=stream';

  $scope.$on('$destroy', function(){
    $http.get('http://voldenuit' + $scope.params.id + '.local:1337/api/stream/stop');
  });

  loop();

  $scope.gphoto = new GPhoto();
  $scope.gphoto.displaySettings('http://voldenuit' + $scope.params.id + '.local:1337');
});