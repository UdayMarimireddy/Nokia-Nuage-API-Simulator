var express  = require( 'express' );
var bodyParser = require( 'body-parser' );var https = require('https');
var fs = require('fs');
var app = express();
var port = 3001;
var routes = require( './routes.js' );
var authorize = require( './jwt-authorize.js' );

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

app.use( bodyParser.urlencoded( { 'extended': 'true' } ) );
app.use( bodyParser.json() );
app.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

app.post( '/YOUA', routes.authenticate );
app.use( '/YOUA/', authorize.tokenAuthentication );
app.get( '/YOUA/getPlaces', routes.getPlaces );
app.post( '/YOUA/getBuses', routes.getBuses );
app.post( '/YOUA/getBusLayout', routes.getBusLayout );

app.use( express.static( 'public_html' ) );
app.get( '/', function( req, res ) {
    res.sendFile( __dirname + '/public_html/' );
} );

var a = https.createServer(options, app).listen(port);
console.log( 'youa listening on port: ' + port + '\nGo For https://localhost:' + port);

//app.listen( 8000 );
//console.log( 'youa listening on port: ' + port + '\nGo For localhost:' + port);
