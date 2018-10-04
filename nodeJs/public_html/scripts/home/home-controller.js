(function() {
    'use strict';

    angular.module('mean.home')
        .controller("homeCtrl", homeCtrl);

    homeCtrl.$inject = ['$rootScope', '$scope', '$state', 'jQueryService', 'homeService'];

    function homeCtrl($rootScope, $scope, $state, jQueryService, homeService) {
                
        $( 'ul li' ).click( function() {
            $( 'li' ).removeClass( 'active' );
            $( this ).addClass( 'active' );
        } );
        
        $( '#home' ).height( $(window).height() - 117 );
        
        $( window ).resize( function() {
            $( '#home' ).height( $( window ).height() - 117 );
        } );
        
        $( '#toggleMenu' ).click( function() {
            $( '#toggleMenuDisplay' ).slideToggle();
        } );
        
        $( '._close' ).click( function() {
            $( '#toggleMenuDisplay' ).slideUp();
        } );
      
        $scope.logout = function()
        {
            $rootScope.blocklogin = true;

            jQueryService.jQueryService();

            localStorage.removeItem( 'userToken' );

            console.log( 'LoggedOut Successful :)' );
            $state.transitionTo( 'mean' );
        };   

        $scope.mongoData = function()
        {
            homeService
                    .getMongoData()
                    .then( function ( success ) {
                        
                        $scope.dataFromMongo = JSON.stringify( success.data[0].username );
                        
                    }, function ( error ) {
                        
                        console.log( error );
                        
                    } ); 
        };
        
        $scope.mariaData = function()
        {                    
            homeService
                    .getMariaData()
                    .then( function ( success ) {
                        
                        $scope.dataFromSQL = JSON.stringify( success.data[0].username );
                        
                    }, function ( error ) {
                        
                        console.log( error );
                        
                    } );
        };
        
    }
})();