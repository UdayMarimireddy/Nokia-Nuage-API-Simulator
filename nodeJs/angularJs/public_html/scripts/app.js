var routerApp = angular.module( 'youaTravels', [ 'ui.bootstrap', 'ui.router', 'oc.lazyLoad', 'ngRoute', 'ui-notification' ] );

routerApp.config( [ '$stateProvider','$urlRouterProvider', '$httpProvider', function( $stateProvider, $urlRouterProvider, $httpProvider ) {

    $urlRouterProvider.otherwise( '/youa/home' );
    $httpProvider.interceptors.push( 'tokenAuthentication' );
    
    $stateProvider
        .state( 'youa', {
            url: '/youa',
            templateUrl: 'views/login.html',
            controller: 'signInCtrl',
            controllerAs: 'signInVM',
            data: {
              loginRequired: false
            },
            resolve: {
                loadMyCtrl: [ '$ocLazyLoad', function( $ocLazyLoad ) {
                    return $ocLazyLoad.load( [
                        {
                            name: 'youa.login',
                            files: [ 'scripts/login.js' ]
                        } 
                    ] );
                } ]
            },
            onEnter: function() {
                console.log( '' );
            }
        })
        
        .state( 'youa.home', {
            url: '/home',
            templateUrl: 'views/home/home.html',
            data: {
              loginRequired: true
            },
            resolve: {
                loadMyCtrl: [ '$ocLazyLoad', function( $ocLazyLoad ) {
                    return $ocLazyLoad.load( [ 
                        {
                            name: 'youa.home',
                            files: [ 'scripts/home.js' ]
                        }
                    ] );
                } ]
            },
            onExit: function() {
                console.log( '' );
            }
        } )
        
        .state( 'youa.home.buses', {
            url: '/buses',
            templateUrl: 'views/home/bus_list.html',
            data: {
              loginRequired: true
            },
            resolve: {
                loadMyCtrl: [ '$ocLazyLoad', function( $ocLazyLoad ) {
                    return $ocLazyLoad.load( [ 
                        {
                            name: 'youa.buslist',
                            files: [ 'scripts/bus-list.js' ]
                        }
                    ] );
                } ]
            }
        } );
    }
] );

routerApp.controller( 'youaCtrl', youaCtrl );

youaCtrl.$inject = [ '$rootScope' ];

function youaCtrl( $rootScope ) {
    
    $rootScope.blocklogin = true;
    
}

routerApp.factory( 'tokenAuthentication', tokenAuthentication );

tokenAuthentication.$inject = [];

function tokenAuthentication() {
    return {
        request: function( config ) {
            
            config.headers.tokenauthenticate = localStorage.getItem( 'userToken' );
            
            return config;
        }
    };
}

routerApp.run( [ '$rootScope', '$location', function( $rootScope, $location ) {
        
        $location.path( '/youa' );
            
        $rootScope.$on( '$stateChangeStart', function ( event, toState, toParams ) {
            var loginRequired = toState.data.loginRequired;

            if( $rootScope.blocklogin && loginRequired )
                window.location.reload();
        } );
        
    }
] );