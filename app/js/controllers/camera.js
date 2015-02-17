'use strict';

app.controller('CamCtrl', function ($scope, $location, $routeParams, $http){
  $scope.params = $routeParams;
  $scope.ghostmode = false;

  $scope.cvs = document.getElementById('cvs');
  $scope.ctx = cvs.getContext('2d');
  $scope.cvs.width = 640;
  $scope.cvs.height = 480;

  // $scope.img = new Image();
  // $scope.img.id = 'camera';
  // document.body.appendChild($scope.img);
  $scope.img = document.getElementById('camera');
  $scope.img.src = 'http://voldenuit' + $scope.params.id + '.local:8080/?action=stream';

  $scope.imgPrev = new Image();
  $scope.imgPrev.id = 'prevCamera';
  var prevId = +$scope.params.id - 1;
  var prevDigit = (prevId.toString().length > 1) ? prevId.toString() : "0" + prevId;
  $scope.imgPrev.src = 'http://voldenuit' + prevDigit + '.local:8080/?action=stream';
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

  // $scope.triggerGhostmode = function(){
  //   $scope.ghostmode = !$scope.ghostmode;
  //   setTimeout(function(){
  //     $scope.$apply();
  //   }, 1);
  // }

});