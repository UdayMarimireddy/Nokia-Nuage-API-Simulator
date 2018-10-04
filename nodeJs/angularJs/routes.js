var mysql = require( 'mysql' );
var jwt = require( 'jsonwebtoken' );

var connection = mysql.createConnection( {
    host     : '127.0.0.1',
    user     : 'root',
    password : '',
    multipleStatements: true    
} );

connection.connect( function( err )
{
    if( !err )
        console.log( 'Connected with SQL ... ' );    
    else
        console.log( 'Error connecting to SQL ... ' + err );    
} );

var createSchema =  "CREATE DATABASE IF NOT EXISTS YOUA;" +
                    "CREATE TABLE IF NOT EXISTS YOUA.USERS ( username varchar( 100 ) PRIMARY KEY, email varchar( 100 ), password varchar( 100 ) );" +
                    "REPLACE INTO YOUA.USERS VALUES ( 'youa', 'youa', 'youa' );" +
                    "CREATE TABLE IF NOT EXISTS YOUA.PLACES ( location varchar( 100 ) PRIMARY KEY, district varchar( 100 ) );" +
                    "REPLACE INTO YOUA.PLACES VALUES ( 'Madanapalle', 'Anantapur' );" +
                    "CREATE TABLE IF NOT EXISTS YOUA.BUSES ( serviceNo int PRIMARY KEY, bus varchar(100), fromLoc varchar(100), toLoc varchar(100), dateTime dateTime );" +
                    "REPLACE INTO YOUA.BUSES VALUES ( 1234, 'CHINNU', 'Madanapalle', 'Anantapur', '2017-06-21 10:58:12' );" +
                    "CREATE TABLE IF NOT EXISTS YOUA.BUS_LAYOUT (fromLoc varchar(100), toLoc varchar(100), boardingPoint JSON, droppingPoint JSON, PRIMARY KEY( fromLoc, toLoc ) );" +
                    "REPLACE INTO YOUA.BUS_LAYOUT VALUES ('Madanapalle', 'Anantapur', '[\"Madanapalle\"]', '[\"Anantapur\"]');";

connection.query( createSchema, function( err ) {
    if ( err )
        console.log( "Error in setting up Database>>>" + err);
    else
        console.log( "Database is Set!!" );
} );

exports.authenticate = function( req, res ) {
    
    var user = req.body.username;
    var email = req.body.email;
    var pass = req.body.password;
    var purpose = req.body.purpose;
    
    if ( purpose === "checkUsers" )
    {
        var QUERY = "SELECT username FROM YOUA.USERS";
    
        console.log("CheckUsers Query: " + QUERY);

        connection.query( QUERY, function( err, rows, fields ) {
            if ( !err )
                res.json( rows );
            else
            {
                console.log(err);
                res.status(500).send('Error while performing Query!');
            }
        } );
    }
    //SignUp Code
    else if ( purpose === "signUp" )
    {
        var QUERY = "INSERT INTO YOUA.USERS VALUES ( '" + user + "', '" + email + "', '" + pass + "' )";
    
        console.log("SignUp Query: " + QUERY);

        connection.query( QUERY, function( err, rows, fields ) {
            
            console.log(err);
            
            if ( !err )
                res.json( rows );
            else
            {
                console.log(err);
                res.status(500).send('Error while performing Query!');
            }
        } );
    }
    //SignIn Code
    else if ( purpose === "signIn" )
    {
        var QUERY = "SELECT username FROM YOUA.USERS WHERE username = '" + user + "' AND password = '" + pass + "'";
    
        console.log("SignIn Query: " + QUERY);

        connection.query( QUERY, function( err, rows, fields ) {
            if ( !err )
            {
                if ( rows.length )
                {
                    console.log( 'Logged in with: ' + user );
                    getUserDB( user, function( user ) {

                        if ( !user )
                            return res.status(401).send("The username is not existing");

                        if ( user.password !== pass )
                            return res.status(401).send("The username or password don't match");

                        res.json( {
                            type: true,
                            data: user,
                            token: createToken( user )
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
            {
                console.log(err);
                res.status(500).send('Error while performing Query!');
            }
        } );
    }

};

//Getting the proper locations from Database
exports.getPlaces = function( req, res ) {
    var QUERY = "SELECT DISTINCT( location ) FROM YOUA.PLACES";
    
    console.log("Location Query: " + QUERY);

    connection.query( QUERY, function( err, rows, fields ) {
        if ( !err )
            res.json( rows );
        else
        {
            console.log(err);
            res.status(500).send('Error while performing Query!');
        }
    } );
};

//Getting the proper buses from Database
exports.getBuses = function( req, res ) {
    var fromLoc = req.body.from;
    var toLoc = req.body.to;
    var onDate = new Date( req.body.onDate );
    
    var fromDate = onDate.getFullYear() + '-' + ( onDate.getMonth() + 1 ) + '-' + onDate.getDate();
    var tillDate = onDate.getFullYear() + '-' + ( onDate.getMonth() + 1 ) + '-' + ( onDate.getDate() + 1 );
    
    var QUERY = "SELECT DISTINCT( bus ), b.* FROM YOUA.BUSES b WHERE fromLoc = '" + fromLoc + "' AND toLoc = '" + toLoc + 
                "' AND dateTime >= '" + fromDate + "' AND dateTime < '" + tillDate + "' Limit 10";
    
    console.log("Bus Query: " + QUERY);
    
    connection.query( QUERY, function( err, rows, fields ) {
        if ( !err )
            res.json( rows );
        else
        {
            console.log(err);
            res.status(500).send('Error while performing Query!');
        }
    } );
};

//Getting the proper buses from Database
exports.getBusLayout = function( req, res ) {
    var fromLoc = req.body.from;
    var toLoc = req.body.to;
    console.log("Date: "+req.body.onDate)
    var onDate = new Date( req.body.onDate );
    
    var fromDate = onDate.getFullYear() + '-' + ( onDate.getMonth() + 1 ) + '-' + onDate.getDate();
    var tillDate = onDate.getFullYear() + '-' + ( onDate.getMonth() + 1 ) + '-' + ( onDate.getDate() + 1 );
    console.log("Date: "+fromDate)
    
    var QUERY = "SELECT bl.boardingPoint, bl.droppingPoint FROM YOUA.BUSES b JOIN YOUA.BUS_LAYOUT bl ON ( b.fromLoc = bl.fromLoc AND b.toLoc = bl.toLoc ) WHERE b.fromLoc = '" + fromLoc + "' AND b.toLoc = '" + toLoc + "' AND b.dateTime >= '" + fromDate + "' AND b.dateTime < '" + tillDate + "'";
    
    console.log("Bus Layout Query: " + QUERY);
    
    connection.query( QUERY, function( err, rows, fields ) {
        if ( !err )
            res.json( rows );
        else
        {
            console.log(err);
            res.status(500).send('Error while performing Query!');
        }
    } );
};

//Creating the JSON Web Token
function createToken( user ) 
{
    return jwt.sign( user, 'secret', { expiresIn: 60 * 60 * 5 } );
}

//Accessing the Database for the specified user
function getUserDB( username, callback )
{
    connection.query( "SELECT * FROM YOUA.USERS WHERE username = '" + username + "';", function( err, rows, fields ) {

        if ( err )
            throw err;

        if ( rows[ 0 ] )
            callback( rows[ 0 ] );
        else
            callback( rows );

    } );
}