angular.module('pirineoPOIApp')

    .controller('starterCtrl', ['$scope', '$state', 'auth', 'uiGmapGoogleMapApi',

        function ($scope, $state, auth, uiGmapGoogleMapApi) {

            $scope.poiList = ["blabla","blabla","blabla","blabla","blabla","blabla","blabla","blabla","blabla",
                "blabla","blabla","blabla","blabla","blabla","blabla","blabla","blabla"];

            // MAP SECTION

            $scope.map = {
                center: {latitude: 45, longitude: -73}, zoom: 8,

                markers: [],
                events: {
                    click: function (mapModel, eventName, originalEventArgs) {
                        $scope.$apply(function () {
                            var e = originalEventArgs[0];
                            var marker = {};
                            marker.coords = {};
                            marker.coords.latitude = e.latLng.lat();
                            marker.coords.longitude = e.latLng.lng();
                            console.log("Saving marker: " + marker.coords.latitude + " ; " + marker.coords.longitude);
                            $scope.map.markers.push(marker);
                        });
                        //TODO: añadir aquí llamada a funcion mostrar formulario
                    }
                }
            };
            $scope.options = {scrollwheel: false, streetViewControl: false, mapTypeControl: false};
            uiGmapGoogleMapApi.then(function (maps) {


            });

        }]);
