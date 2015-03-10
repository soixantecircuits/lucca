var finalhandler = require('finalhandler'),
  http = require('http'),
  serveStatic = require('serve-static'),
  pathHelper = require('path'),
  ip = require('ip'),
  port = 9001,
  title = 'node-lucca',
  argv = require('minimist')(process.argv.slice(2));

port = argv.port || port;
process.title = argv.title || title;

// Serve up public/ftp folder
var serve = serveStatic(pathHelper.join(__dirname, 'app'), {
  'index': ['index.html', 'index.htm']
});

// Create server
var server = http.createServer(function(req, res) {
  var done = finalhandler(req, res);
  serve(req, res, done);
});

// Listen
server.listen(port);
console.log('server listen on: http://' + ip.address() + ':' + port);
