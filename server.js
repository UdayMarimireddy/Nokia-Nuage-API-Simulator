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

app.get( '/nuage/', function(req, res){
    
    var i = 0;
    var num = 25;
    var array = [];
    var obj = {
    "children": null,
    "parentType": "nsgateway",
    "entityScope": "ENTERPRISE",
    "lastUpdatedBy": "43f8868f-4bc1-472c-9d19-533dcfcb1ee0",
    "lastUpdatedDate": 1524704415000,
    "creationDate": 1524704415000,
    "name": "NSG-X5 54.222.107.189 NSG Physical Port configuration error.",
    "reason": "NSG Physical Port configuration error.",
    "description": "The NSG has invalid Physical Port name assigned.  Check physical names assigned to ports on the NSG.",
    "acknowledged": false,
    "numberOfOccurances": 2,
    "severity": "INFO",
    "errorCondition": 3746,
    "owner": "43f8868f-4bc1-472c-9d19-533dcfcb1ee0",
    "ID": "a2b39988-1720-42a8-a10e-6183315105a7",
    "parentID": "c48df22c-25de-4d43-801b-2ff2be01c0bc",
    "externalID": null,
    "timestamp": 1524686415286,
    "targetObject": "nsgateway",
    "alarmedObjectID": "c48df22c-25de-4d43-801b-2ff2be01c0bc",
    "enterpriseID": "1960a790-4176-4b22-8c84-806d41e73987"
  };

          array.push(obj);
      do
      {
          i++;
          var obj1 = JSON.parse(JSON.stringify(obj));
          obj1.reason += "-" + i;
          obj1.parentID += "-" + i;
          array.push(obj1);
      }while( i < num -1 );
    
    res.send(array);} );
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
