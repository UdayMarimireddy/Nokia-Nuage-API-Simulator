(function() {
    'use strict';

    angular.module('mean.home')
        .factory("homeService", homeService);

    homeService.$inject = ['$http'];

    function homeService($http) {

        return {
            getMongoData: getMongoData,          
            getMariaData: getMariaData          
        };

        function getMongoData() {    
            var token = localStorage.getItem( 'userToken' );
            
            return $http( {
                method: 'POST',
                type: 'JSON',
//                data: { token: token },
                url: '/MEAN/getMongoData'
            } );
        }

        function getMariaData() { 
            var token = localStorage.getItem( 'userToken' );
            
            return $http( {
                method: 'POST',
                type: 'JSON',
//                data: { token: token },
                url: '/MEAN/getMySQLData'
            } );
        }
    }
})();