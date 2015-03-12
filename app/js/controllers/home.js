'use strict';

app.controller('HomeCtrl', function ($scope, $rootScope, $location, ZhaoxiangService, $templateCache){
  $templateCache.removeAll();
  var APIs = [];
  $rootScope.availableCameras = [];

  function init(){
    ZhaoxiangService.doActionForAll(function (camera){
      var ctn = document.createElement('div');
      var link = document.createElement('a');
      var span = document.createElement('span');
      var img = document.createElement('img');

      link.href = '#/cam/' + camera.digit;
      link.className = 'camera-list'
      span.textContent = '#' + camera.digit;
      img.id = 'camera-' + camera.digit;

      document.getElementById('cameras').appendChild(ctn)
      ctn.appendChild(link);
      link.appendChild(img);
      ctn.appendChild(span);
    });
  }

  function visuallyClassifiedElements(){
    var cameras = ZhaoxiangService.getAllStatus();
    for (var i = 0; i < cameras.connected.length; i++) {
      document.getElementById('camera-' + cameras.connected[i].digit).parentElement.parentElement.classList.add('is-connected');
    }
    for (var i = 0; i < cameras.notConnected.length; i++) {
      document.getElementById('camera-' + cameras.notConnected[i].digit).parentElement.parentElement.classList.add('is-not-connected');
      document.getElementById('camera-' + cameras.notConnected[i].digit).parentElement.href = '#/';
    }
    console.log(cameras);
  }

  $scope.getPreview = function(){
    if(!$rootScope.isLoading){
      ZhaoxiangService.getAllPreviews(function (res, id){
        var domElement = document.getElementById('camera-' + id);
        domElement.parentElement.parentElement.classList.add('has-preview');
        domElement.src = ZhaoxiangService.getCameraAddress(id) + res + '?q=' + new Date().getTime();
      });
    }
  }

  if($rootScope.isLoading){
    $rootScope.$on('ZhaoxiangInitEnded', function(){
      init();
      visuallyClassifiedElements();
    });
  } else {
    init();
    visuallyClassifiedElements();
  }

});
