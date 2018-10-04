(function() {
    'use strict';

    angular.module('mean.login')
        .factory("loginService", loginService);

    loginService.$inject = ['$http'];

    function loginService($http) {
        return {
            login: login
        };

        function login(user, pass) {
            var loginDetails = { 'user': user, 'pass': pass };
            
            return $http( {
                method: 'POST',
                type: 'JSON',
                data: loginDetails,
                url: '/MEAN'
            } );
        }
    }
})();