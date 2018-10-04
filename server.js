var express  = require( 'express' );
var https = require( 'https' );
var fs = require( "fs" );
var app = express();
var port = 8443;
var routes = require( './routes.js' );

/*
 *
 * @Self-signed certificate
 * openssl genrsa -out key.pem
 * openssl req -new -key key.pem -out csr.pem
 * openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
 * rm csr.pem
 */

var options = {
  key: fs.readFileSync('SSL/key.pem'),
  cert: fs.readFileSync('SSL/cert.pem')
};

app.get( '/nuage/', function(req, res){ res.send(); } );
app.get( '/nuage/api/v5_0/me', routes.tokenAuthorization );
app.get( '/nuage/api/v5_0/enterprises/', routes.getNuageEnterprises );
app.get( '/nuage/api/v5_0/enterprises/:id/nsgateways/', routes.getNuageNSGateways );
app.get( '/nuage/api/v5_0/enterprises/:id/allalarms/', routes.getNuageAllAlarms );
app.get( '/nuage/api/v5_0/nsgateways/:id/nsports/', routes.getNuageNSPorts );

//An error handling middleware
app.use( function(err, req, res, next ) {
   res.send( "Oops, something went wrong." )
} );

https.createServer( options, app ).listen( port );
console.log( 'SERVER LISTENING ON PORT: ' + port );
