(function() {
    'use strict';

    angular.module("youa.home", [])
        .controller("homeCtrl", homeCtrl)
        .controller("homeContentCtrl", homeContentCtrl)
        .factory("homeService", homeService);

    homeCtrl.$inject = ['$rootScope', '$scope', '$state', 'homeService', 'Notification'];

    function homeCtrl($rootScope, $scope, $state, homeService, Notification) {
        
        $scope.places = [];$scope.boardingPoint = "Madanapalle";
        
        _init();
        
        function _init()
        {
            homeService
                    .getPlaces()
                    .then( function ( success ) {
                        
                        for ( var i in success.data )
                        {
                            $scope.places.push( success.data[ i ].location );
                        }
                        
                    }, function ( error ) {
                        
                        console.log( error );
                        Notification.error(error.data);
                        
                    } ); 
        }
                
        $( 'ul li' ).click( function() {
            $( 'li' ).removeClass( 'active' );
            $( this ).addClass( 'active' );
        } );
        
        $( '#home' ).height( $(window).height() - 100 );
        
        $( window ).resize( function() {
            $( '#home' ).height( $( window ).height() - 100 );
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

            localStorage.removeItem( 'userToken' );

            Notification.success( "Signout Successful!!" );
            $state.go( 'youa' );
        };   
        
    }
    
    homeContentCtrl.$inject = ['$rootScope', '$scope', '$state', 'homeService', 'Notification'];

    function homeContentCtrl($rootScope, $scope, $state, homeService, Notification) {
        
        $scope.from = "Madanapalle";
        $scope.to = "Anantapur";
        $scope.onDate = new Date();
        
        $( '.locationAC' ).focus( function() {
            $( this ).autocomplete( {
                source: $scope.places,
                minLength: 2,
                autoFocus:true,
                delay:500,
                cache: false,
                classes: {
                    "ui-autocomplete": "autoc_drop_down"
                }
            } );
        } );  
        
        $scope.searchSubmit = function( from, to, onDate )
        {
            $scope.buses = [];
            
            homeService
                    .getBuses( from, to, onDate )
                    .then( function ( success ) {
                        
                        for ( var i in success.data )
                        {
                            var date = new Date( success.data[ i ].dateTime );
                            var busInfo = {
                                'serviceNo': success.data[ i ].serviceNo,
                                'bus': success.data[ i ].bus,
                                'fromLoc': success.data[ i ].fromLoc,
                                'toLoc': success.data[ i ].toLoc,
                                'time': date.getHours() + ':' + date.getMinutes(),
                                'dateTime': success.data[ i ].dateTime
                            };
                            
                            $scope.buses.push( busInfo );
                            homeService
                                    .setBusInfo( $scope.buses );
                        }
                        if ( !$scope.buses.length )
                            Notification.info( "No buses are available in this route, Sorry for your Inconvenience..!" );
                        else
                            $state.go( "youa.home.buses" );
                        
                        console.log( JSON.stringify( $scope.buses ) );
                        
                    }, function ( error ) {
                        
                        console.log( error );
                        Notification.error(error.data);
                        
                    } ); 
        };
        
        // Clicking any seat
        $(".seatNumber").click(
            function () {
                if (!$(this).hasClass("seatUnavailable")){
                    // If selected, unselect it
                    if ($(this).hasClass("seatSelected")) {
                        var thisId = $(this).attr('id');
                        var price = $('#seatsList .' + thisId).val();
                        $(this).removeClass("seatSelected");
                        $('#seatsList .' + thisId).remove();
                        // Calling functions to update checkout total and seat counter.
                        removeFromCheckout(price);
                        refreshCounter();
                    }
                    else {
                        // else, select it
                        // getting values from Seat
                        var thisId = $(this).attr('id');
                        var id = thisId.split("_");
                        var price = $(this).attr('value');
                        var seatDetails = "Row: " + id[0] + " Seat:" + id[1] + " Price:CA$:" + price;


                        var freeSeats = parseInt($('.freeSeats').first().text());
                        var selectedSeats = parseInt($(".seatSelected").length);

                        // If you have free seats available the price of this one will be 0.
                        if (selectedSeats < freeSeats) {
                            price = 0;
                        }

                        // Adding this seat to the list
                        var seatDetails = "Row: " + id[0] + " Seat:" + id[1] + " Price:CA$:" + price;
                        $("#seatsList").append('<li value=' + price + ' class=' + thisId + '>' + seatDetails + "  " + "<button id='remove:" + thisId + "'+ class='btn btn-default btn-sm removeSeat' value='" + price + "'><strong>X</strong></button></li>");
                        $(this).addClass("seatSelected");

                        addToCheckout(price);
                        refreshCounter();
                    }
                }
            }
        );
        // Clicking any of the dynamically-generated X buttons on the list
        $(document).on('click', ".removeSeat", function () {
            // Getting the Id of the Seat
            var id = $(this).attr('id').split(":");
            var price = $(this).attr('value')
            $('#seatsList .' + id[1]).remove();
            $("#" + id[1] + ".seatNumber").removeClass("seatSelected");
            removeFromCheckout(price);
            refreshCounter();
          }
      );
        // Show tooltip on hover.
        $(".seatNumber").hover(
            function () {
                if (!$(this).hasClass("seatUnavailable")) {
                    var id = $(this).attr('id');
                    var id = id.split("_");
                    var price = $(this).attr('value');
                    var tooltip = "Row: " + id[0] + " Seat:" + id[1] + " Price:CA$:" + price;

                    $(this).prop('title', tooltip);
                } else
                {
                    $(this).prop('title', "Seat unavailable");
                }
            }
            );
        // Function to refresh seats counter
        function refreshCounter() {
            $(".seatsAmount").text($(".seatSelected").length); 
        }
        // Add seat to checkout
        function addToCheckout(thisSeat) {
            var seatPrice = parseInt(thisSeat);
            var num = parseInt($('.txtSubTotal').text());
            num += seatPrice;
            num = num.toString();
            $('.txtSubTotal').text(num);
        }
        // Remove seat from checkout
        function removeFromCheckout(thisSeat) {
            var seatPrice = parseInt(thisSeat);
            var num = parseInt($('.txtSubTotal').text());
            num -= seatPrice;
            num = num.toString();
            $('.txtSubTotal').text(num);
        }

        // Clear seats.
        $("#btnClear").click(
            function () {
                $('.txtSubTotal').text(0);
                $(".seatsAmount").text(0);
                $('.seatSelected').removeClass('seatSelected');
                $('#seatsList li').remove();
            }
        );
    }

    homeService.$inject = ['$http'];

    function homeService($http) {

        return {
            getPlaces: getPlaces,        
            getBuses: getBuses,
            setBusInfo: setBusInfo,
            getBusInfo: getBusInfo
        };

        function getPlaces() {                
            return $http( {
                method: 'GET',
                type: 'JSON',
                url: '/YOUA/getPlaces'
            } );
        }

        function getBuses( from, to, onDate ) {                
            return $http( {
                method: 'POST',
                type: 'JSON',
                data: { from: from, to: to, onDate: onDate },
                url: '/YOUA/getBuses'
            } );
        }

        var busInfo;
        
        function setBusInfo( data ) {  
            busInfo = data;
        }

        function getBusInfo() {
            return busInfo;
        }
    }
})();