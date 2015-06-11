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
  localStorage = new LocalStorage('./calibration-data');
}

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
app.use(express.static('bower_components'));

app.use('/camcalib/:calibration', function (req, res, next) {
  console.log('Request Type:', req.method);
  /*console.log('Request id:', req.params.calibration);*/
  if(req.method == 'POST'){
    if(req.params.calibration){
      localStorage.setItem('camcalib', req.params.calibration);
    }
    res.status(200).end();
    next();
  }
});

app.get('/camcalib/', function(req, res){
    res.status(200);
    res.json(localStorage.getItem('camcalib'));
});

// Listen
//server.listen(port);
app.listen(port);
console.log('server listen on: http://' + ip.address() + ':' + port);
