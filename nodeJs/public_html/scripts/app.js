var routerApp = angular.module( 'mean', [ 'ui.bootstrap', 'ui.router', 'oc.lazyLoad', 'ngRoute' ] );

routerApp.config( [ '$stateProvider','$urlRouterProvider', '$locationProvider', '$httpProvider', function( $stateProvider, $urlRouterProvider, $locationProvider, $httpProvider ) {

    $urlRouterProvider.otherwise( '/mean/home' );
    $httpProvider.interceptors.push( 'tokenAuthentication' );
    
    $stateProvider
        .state( 'mean', {
            url: '/mean',
            templateUrl: 'views/mean.html',
            data: {
              loginRequired: false
            },
            resolve: {
                loadMyCtrl: [ '$ocLazyLoad', function( $ocLazyLoad ) {
                    return $ocLazyLoad.load( [
                        {
                            name: 'mean.login',
                            files: [ 'scripts/login/login.js',
                                'scripts/login/login-controller.js',
                                'scripts/login/login-service.js'
                            ]
                        } 
                    ] );
                } ]
            },
            onEnter: function() {
                console.log( '' );
            }
        })
        
        .state( 'mean.home', {
            url: '/home',
            templateUrl: 'views/home/home.html',
            data: {
              loginRequired: true
            },
            resolve: {
                loadMyCtrl: [ '$ocLazyLoad', function( $ocLazyLoad ) {
                    return $ocLazyLoad.load( [ 
                        {
                            name: 'mean.home',
                            files: [ 'scripts/home/home.js',
                                'scripts/home/home-controller.js',
                                'scripts/home/home-service.js'
                            ]
                        }
                    ] );
                } ]
            },
            onExit: function() {
                console.log( '' );
            }
        } )
        
        .state( 'mean.home.about', {
            url: '/about',
            templateUrl: 'views/about/about.html',
            data: {
              loginRequired: true
            }
        } );
    }
] );

routerApp.controller( 'MainCtrl', MainCtrl );

MainCtrl.$inject = [ '$rootScope', '$scope', '$state', 'jQueryService' ];

function MainCtrl( $rootScope, $scope, $state, jQueryService ) {

    $rootScope.title = "MEAN";
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

routerApp.service( 'jQueryService', jQueryService );

jQueryService.$inject = [];

function jQueryService() {
    return {
        jQueryService: jQueryService
    };
    
    function jQueryService() 
    {
        $( document ).ready( function() {
            var bodyHeight = $( window ).height() ;
        } );
    }
}

routerApp.run( [ '$rootScope', '$location', '$state', function( $rootScope, $location, $state ) {
        
        $location.path( '/mean' );
            
        $rootScope.$on( '$stateChangeStart', function ( event, toState, toParams ) {
            var loginRequired = toState.data.loginRequired;

            if( $rootScope.blocklogin )
            {
                $state.go( 'mean' );
                
                if ( loginRequired )
                    window.location.reload();
            }
            else 
                $state.go( toState.name );
        } );
        
    }
] );