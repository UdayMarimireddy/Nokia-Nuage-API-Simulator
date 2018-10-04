(function() {
    'use strict';

    angular.module('mean.login')
        .controller("loginCtrl", loginCtrl);

    loginCtrl.$inject = ['$rootScope', '$scope', '$state', 'jQueryService', 'loginService'];

    function loginCtrl($rootScope, $scope, $state, jQueryService, loginService) {
        
        jQueryService.jQueryService(); 
        $( '.alert-warning' ).hide();

        $scope.login = function() {
            
            $rootScope.user = $scope.username;
            
            loginService
                    .login($scope.username, $scope.password)
                    .then( function ( success ) {
                        
                        if ( success.data.type === true ) {
                            localStorage.setItem( 'userToken', success.data.token );
                            
//                            $scope.tokenClaims = getClaimsFromToken();
                            
                            $rootScope.blocklogin = false;
                            $scope.message = "Successfully LoggedIn :)";   
                            $state.go( 'mean.home' );                            
                        }
                        else {
                            $scope.message = "Sorry Please.. :("; 
                            $( '.alert-warning' ).show();                   
                        }
                        console.log($scope.message);                       
                        
                    }, function ( error ) {
                        
                        console.log( error );
                        
                    } );
                
        };
                            
//        function getClaimsFromToken()
//        {
//            var token = localStorage.getItem( 'userToken' );
//            var user = {};
//            
//            if ( typeof token !== 'undefined' )
//            {
//                var encoded = token.split( '.' )[ 1 ];
//                user = JSON.parse( urlBase64Decode( encoded ) );
//            }
//            return user;
//        }
//        
//        function urlBase64Decode( str )
//        {
//            var output = str.replace( '-', '+' ).replace( '_', '/' );
//            
//            switch ( output.length % 4 )
//            {
//                case 0:
//                    break;
//                case 2:
//                    output += '==';
//                    break;
//                case 3:
//                    output += '=';
//                    break;
//                default:
//                    throw 'Illegal base64url string!';
//            }
//            
//            return window.atob( output );
//        }
               
        $( window ).resize(function() {
            jQueryService.jQueryService();
        });
        
        $( '.close' ).click( function() {
            $( '.alert-warning' ).hide();
        } );

    }
})();