'use strict';

app.controller('HomeCtrl', function ($scope, $location){
  var request = window.superagent;
  var APIs = [];

  function init(){
    var rpi = config.raspberrypi;

    document.getElementById('getCamTrigger').onclick = function(){
      for (var i = 1; i <= rpi.population; i++) {
        initCamera(i, '/api/shoot/jpeg');
      }
    }

    for (var i = 1; i <= rpi.population; i++) {
      var digit = (i.toString().length > 1) ? i.toString() : "0" + i;
      APIs[i] = 'http://' + rpi.basename + digit + '.local:' + rpi.port;

      var ctn = document.createElement('div');
      var link = document.createElement('a');
      var span = document.createElement('span');
      var img = document.createElement('img');

      // link.href = '#/cam/';
      link.href = '#/cam/' + digit;
      span.textContent = '#' + digit;
      img.id = 'camera-' + i;
      img.src = 'http://fakeimg.pl/200x133';

      document.getElementById('cameras').appendChild(ctn)
      ctn.appendChild(link);
      link.appendChild(img);
      ctn.appendChild(span);
    };
  }

  function initCamera(index, path){
    request
      .get(APIs[index] + path)
      .end(function (err, res){
        if(err){
          console.log(err);
        } else {
          document.getElementById('camera-' + index).src = APIs[index] + res.text
        }
      })
  }

  init();
});