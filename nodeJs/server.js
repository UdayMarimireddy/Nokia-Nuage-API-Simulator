var express  = require( 'express' );
var http  = require( 'http' );
var bodyParser = require( 'body-parser' );
var app = express();
var port = 3001;
var routes = require( './routes.js' );
var authorize = require( './jwt-authorize.js' );
var httpServer = http.createServer( app );

app.locals.title = 'MEAN';
app.set( 'title', 'MEAN' );
app.use( bodyParser.urlencoded( { 'extended': 'true' } ) );
app.use( bodyParser.json() );
app.use( bodyParser.json( { type: 'application/vnd.api+json' } ) );

app.all( '/MEAN', routes.authenticate );
app.use( '/MEAN/', authorize.tokenAuthentication );
app.post( '/MEAN/getMongoData', routes.getMongoData );
app.post( '/MEAN/getMySQLData', routes.getMySQLData );

app.use( express.static( 'public_html' ) );
app.get( '/', function( req, res ) {
    res.sendFile( __dirname + '/public_html/' );
} );

httpServer.listen( port );
console.log( 'listening on port: ' + port );
