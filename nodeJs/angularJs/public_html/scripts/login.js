(function() {
    'use strict';

    angular.module("youa.login", [])
        .controller("signInCtrl", signInCtrl)
        .service("signInService", signInService)
        .directive("compareTo", signUpDirective); 

    signInCtrl.$inject = ['$rootScope', '$scope', '$state', 'signInService', 'Notification'];

    function signInCtrl($rootScope, $scope, $state, signInService, Notification) {
        
        var THIS = this;
        
        $( '#loginPage' ).height( $(window).height() );
        
        $( window ).resize( function() {
            $( '#loginPage' ).height( $( window ).height() );
        } );
        
        THIS.login = function() {
            
            var signInInfo = {
                "username": THIS.user,
                "password": THIS.pass,
                "purpose": "signIn"
            };
            
            signInService
                    .signIn( signInInfo )
                    .then( function ( success ) {
                        
                        if ( success.data.type === true ) {
                            localStorage.setItem( 'userToken', success.data.token );
                            
                            $rootScope.blocklogin = false;
                            Notification.success('Signin Successful!!');
                            $state.go( 'youa.home' );
                        }
                        else {
                            Notification.error('Sorry, wrong username or password..');
                        }                   
                        
                    }, function ( error ) {
                        
                        console.log( error );
                        Notification.error(error.data);
                        
                    } );
                
        };

        THIS.signup = function() {
            THIS.usersList = [];
            
            var checkUsersInfo = {
                "username": THIS.username,
                "purpose": "checkUsers"
            };
            
            signInService
                    .checkUsername( checkUsersInfo )
                    .then( function ( success ) {
                        for ( var i in success.data )
                        {
                            THIS.usersList.push( success.data[ i ].username );
                        }

                        if ( THIS.usersList.indexOf( THIS.username ) === -1 )
                        {
                            var signUpInfo = {
                                "username": THIS.username,
                                "email": THIS.email,
                                "password": THIS.password,
                                "purpose": "signUp"
                            };

                            signInService
                                    .signup( signUpInfo )
                                    .then( function ( success ) {

                                        Notification.success( "Registered!! You can signin now.." );

                                    }, function ( error ) {
                        
                                        console.log( error );
                                        Notification.error(error.data);

                                    } );
                        }
                        else
                        {
                            Notification.warning("User already Exists, please try with other username..!");
                        }
            }, function ( error ) {
                        
                console.log( error );
                Notification.error(error.data);

            } );
        };
    }

    signInService.$inject = ['$http'];

    function signInService($http) {
        return {
            signIn: signIn,
            signup: signup,
            checkUsername: checkUsername
        };

        function signIn( signInInfo ) {
            
            return $http( {
                method: 'POST',
                type: 'JSON',
                data:  signInInfo ,
                url: '/YOUA'
            } );
        }

        function signup( signupInfo ) {
            
            return $http( {
                method: 'POST',
                type: 'JSON',
                data: signupInfo,
                url: '/YOUA'
            } );
        }

        function checkUsername( checkUsersInfo ) {
            
            return $http( {
                method: 'POST',
                type: 'JSON',
                data:  checkUsersInfo ,
                url: '/YOUA'
            } );
        }
    }

    function signUpDirective()  
    {  
        return {  
            require: "ngModel",  
            scope:  
            {  
                confirmPassword: "=compareTo"  
            },  
            link: function (scope, element, attributes, modelVal)  
            {  
                modelVal.$validators.compareTo = function (val)  
                {  
                    return val == scope.confirmPassword;  
                };  
                scope.$watch("confirmPassword", function ()  
                {  
                    modelVal.$validate();  
                });  
            }  
        };  
    }
})();