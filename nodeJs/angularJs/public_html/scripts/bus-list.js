(function() {
    'use strict';

    angular.module("youa.buslist", [])
        .controller("busListCtrl", busListCtrl)
        .factory("busListService", busListService);

    busListCtrl.$inject = ['$rootScope', '$scope', '$state', 'homeService', 'busListService', 'Notification'];

    function busListCtrl($rootScope, $scope, $state, homeService, busListService, Notification) {
        
        $scope.buses = homeService
                .getBusInfo();
        
        $scope.showBusLayout = function( from, to, onDate, index )
        {
            $scope.showLayout = index;
            $scope.boardingPoint = "Madanapalle";
            
            busListService
                    .getBusLayout( from, to, onDate )
                    .then( function ( success ) {
                        
                        $scope.boardingPoints = JSON.parse( success.data[ 0 ].boardingPoint );
                        $scope.droppingPoints = JSON.parse( success.data[ 0 ].droppingPoint );
                        
                    }, function ( error ) {
                        
                        console.log( error );
                        Notification.error(error.data);
                        
                    } ); 
        }; 
                        
        $scope.showSeatLayout = function( from, to, onDate )
        {
            if ( $scope.showSeatLayoutFlag )
                $scope.showSeatLayoutFlag = false;
            else
                $scope.showSeatLayoutFlag = true;
        };
        
    }

    busListService.$inject = ['$http'];

    function busListService($http) {

        return {
            getBusLayout: getBusLayout 
        };

        function getBusLayout( from, to, onDate ) {                
            return $http( {
                method: 'POST',
                type: 'JSON',
                data: { from: from, to: to, onDate: onDate },
                url: '/YOUA/getBusLayout'
            } );
        }
    }
})();