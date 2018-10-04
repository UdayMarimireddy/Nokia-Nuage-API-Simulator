var mysql = require( 'mysql' );
var mongoose = require( 'mongoose' );
var jwt = require( 'jsonwebtoken' );

mongoose.connect( 'mongodb://localhost/angularJs' );

var db = mongoose.connection;

db.on( 'error', console.error.bind( console, 'Error connecting to Mongo ... ' ) );
db.once( 'open', function() {
    console.log( 'Connected with Mongo ... ' );
} );

var schema = mongoose.Schema();

var mongoDB = mongoose.model( 'mean', schema );

var connection = mysql.createConnection( {
    host     : 'localhost',
    user     : 'root',
    password : ''
} );

connection.connect( function( err )
{
    if( !err )
        console.log( 'Connected with SQL ... ' );    
    else
        console.log( 'Error connecting to SQL ... ' );    
} );

var createDatabase = "CREATE DATABASE IF NOT EXISTS MEAN";
var createTable = "CREATE TABLE IF NOT EXISTS MEAN.MEAN ( username varchar( 20 ) PRIMARY KEY, password varchar( 20 ) )";
var InsertDataToTable = "REPLACE INTO MEAN.MEAN VALUES ( 'mean', 'mean' )";

connection.query( createDatabase, function( err ) {} );
        
connection.query( createTable, function( err ) {} );
        
connection.query( InsertDataToTable, function( err ) {} );


exports.authenticate = function( req, res ) {
    
    var user = req.body.user;
    var pass = req.body.pass;
    
    console.log( req.app.locals.title );
    console.log( req.app.get( 'title' ) );

    var QUERY = "SELECT username FROM MEAN.MEAN WHERE username = '" + user + "' AND password = '" + pass + "'";

    connection.query( QUERY, function( err, rows, fields ) {
        if ( !err )
        {
            if ( rows.length )
            {
                console.log( 'Successfully LoggedIn to: ' + user );

                var mongoModel = new mongoDB();
                mongoModel.username = user;
                mongoModel.password = pass;

                mongoModel.save( function( err, user ) {
                    user.token = jwt.sign( user, 'secret' );
                    user.save( function( err, user1 ) {
                        res.json( {
                            type: true,
                            data: user1,
                            token: user1.token
                        } );
                    } );
                } ); 
            }
            else
            {
                console.log( 'Please check your login-credentials' );
                res.json( {
                    type: false,
                    data: "Incorrect email/password"
                } );
            }
        }
        else
            console.log('Error while performing Query.');
    } );

};

exports.getMongoData = function(req, res) {
    
    mongoDB.find( {}, function( err, task ) {
        if ( err )
            res.send( err );

        res.json( task );
    } );

};

exports.getMySQLData = function( req, res ) {
    
    var QUERY = "SELECT username FROM MEAN.MEAN";

    connection.query( QUERY, function( err, rows, fields ) {
        if ( !err )
            res.json( rows );
    } );

};