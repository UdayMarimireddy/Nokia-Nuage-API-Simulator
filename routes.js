var fs = require( "fs" );

exports.tokenAuthorization = function( req, res ) {
   // Get content from file
    var contents = fs.readFileSync( "nuageAuthorization.json" );
   // Define to JSON type
    var jsonContent = JSON.parse( contents );
    
    res.send( jsonContent );
};

exports.getNuageEnterprises = function( req, res ) {
   // Get content from file
    var contents = fs.readFileSync( "nuageEnterprises.json" );
   // Define to JSON type
    var jsonContent = JSON.parse( contents );
    
    res.send( jsonContent );
};

exports.getNuageNSGateways = function( req, res ) {
   // Get content from file
    var contents = fs.readFileSync( req.params.id + "nuageNSGateways_350.json" );
   // Define to JSON type
    var jsonContent = JSON.parse( contents );
    
    res.send( jsonContent );
};

exports.getNuageAllAlarms = function( req, res ) {
   // Get content from file
    var contents = fs.readFileSync( req.params.id + "nuageAllAlarms_25.json" );
   // Define to JSON type
    var jsonContent = JSON.parse( contents );

    res.send( jsonContent );
};

exports.getNuageNSPorts = function( req, res ) {
   // Get content from file
    var contents = fs.readFileSync( req.params.id + "nuageNSPorts.json" );
   // Define to JSON type
    var jsonContent = JSON.parse( contents );

    res.send( jsonContent );
};
