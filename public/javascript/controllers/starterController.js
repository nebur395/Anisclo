angular.module('pirineoPOIApp')


/*.controller('starterCtrl', function($scope) {
    angular.extend($scope, {
        map: {
            center: {
                latitude: 42.3349940452867,
                longitude:-71.0353168884369
            },
            zoom: 11,
            markers: [],
            events: {
                click: function(map, eventName, originalEventArgs) {
                    var e = originalEventsArgs[0];
                    var lat = e.latLng.lat(),lon= e.latLng.lng();
                    var marker = {
                        id: Date.now(),
                        coords: {
                            latitude: lat,
                            longitude: lon
                        }
                    };
                    $scope.map.markers.push(marker);
                    console.log($scope.map.markers);
                    $scope.$apply();
                    }
                }
            }
        });
    });*/



    .controller('starterCtrl', ['$scope', '$state', 'auth', 'uiGmapGoogleMapApi',

        function ($scope, $state, auth, uiGmapGoogleMapApi) {
            var times=0;
            $scope.map = {
                center: { latitude: 45, longitude: -73 }, zoom: 8,
                markers: [],
                events: {
                    click: function(mapModel, eventName, originalEventArgs)
            {
                $scope.$apply(function(){
                    var e = originalEventArgs[0];
                    var marker = {};
                    marker.coords = {};
                    marker.coords.latitude = e.latLng.lat();
                    marker.coords.longitude = e.latLng.lng();
                    console.log("Saving marker: "+marker.coords.latitude + " ; "+marker.coords.longitude + " with name: " );
                    $scope.map.markers.push(marker)
                });
            }
                }
            };
            $scope.options = { scrollwheel: false, streetViewControl:false };
            //$scope.map = {        };
            uiGmapGoogleMapApi.then(function(maps) {


            });

        /*angular.extend($scope, {
            map: {
                center: {
                    latitude: 42.3349940452867,
                    longitude: -71.0353168884369
                },
                zoom:11,
                markers: [],
                events: {
                click: function (map, eventName, originalEventArgs){
                    var e = originalEventArgs[0];
                    var lat = e.latLng.lat(),lon = e.latLng.lng();
                    console.log("detecto click en" +lat + ";"+lon);
                    var marker = {
                        id: Date.now(),
                        coords: {
                            latitude: lat,
                            longitude: lon
                        }
                    };
                    $scope.map.markers.push(marker);
                    console.log($scope.map.markers);
                    $scope.$apply();
                }
                }
            }
        })*/


    }]);
