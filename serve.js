var finalhandler = require('finalhandler'),
  http = require('http'),
  express = require('express'),
  serveStatic = require('serve-static'),
  pathHelper = require('path'),
  ip = require('ip'),
  port = 9001,
  title = 'node-lucca',
  argv = require('minimist')(process.argv.slice(2));

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
 
localStorage.setItem('cameraCalib', 'myFirstValue');
console.log(localStorage.getItem('myFirstKey'));

var app = express();

port = argv.port || port;
process.title = argv.title || title;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Serve up public/ftp folder
app.use(serveStatic(pathHelper.join(__dirname, 'app'), {'index': ['index.html', 'index.htm']}));

app.use('/camcalib/:calibration', function (req, res, next) {
  console.log('Request Type:', req.method);
  /*console.log('Request id:', req.params.calibration);*/
  if(req.method == 'POST'){
    if(req.params.calibration){
      localStorage.setItem('camcalib', req.params.calibration);
    }
    res.status(200).end();
    next();  
  } else if(req.method == 'GET'){
    res.status(200);
    res.json(localStorage.setItem('camcalib'));
  }
  
});

// Create server
/*var server = http.createServer(function(req, res) {
  var done = finalhandler(req, res);
  serve(req, res, done);
});*/

// Listen
//server.listen(port);
app.listen(port);
console.log('server listen on: http://' + ip.address() + ':' + port);
