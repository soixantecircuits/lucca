var Statique = require("statique");

// Create *Le Statique* server
var server = new Statique({
  root: __dirname + "/app",
  cache: 36000
}).setRoutes({
  "/": "/index.html"
});

// Create server
app = require('http').createServer(server.serve).listen(5050);
console.log('listening on http://0.0.0.0:5050');