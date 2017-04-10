angular.module('pirineoPOIApp')

    .controller('starterCtrl', ['$scope', '$state', 'auth', 'uiGmapGoogleMapApi',

        function ($scope, $state, auth, uiGmapGoogleMapApi) {

            $scope.poiList = [
                {id:1,name:"1",description:"11",tags:"#1",lat:1,lng:1,url:"111",image:"",owner:"1111"},
                {id:2,name:"2",description:"22",tags:"#2",lat:2,lng:2,url:"222",image:"",owner:"2222"}
            ];

            // MODAL POI SECTION

            $scope.poiModal = {    // temporal POI data on modals
                id: 0,
                name: "",
                description: "",
                tags: "",
                lat: 0,
                lng: 0,
                url: "",
                image: "",
                owner: ""
            };

            // open modal with [POI] information
            $scope.openPOIModal = function (poi) {
                $("#poiModal").modal("show");
                $scope.poiModal = {
                    id: poi.id,
                    name: poi.name,
                    description: poi.description,
                    tags: poi.tags,
                    lat: poi.lat,
                    lng: poi.lng,
                    url: poi.url,
                    image: poi.image,
                    owner: poi.owner
                };
            };

            // save record
            $scope.savePOI = function () {
                $("#poiModal").modal("hide");
                $scope.save = true; //flag to indicate that we are saving the record
                $("#poiModal").on('hidden.bs.modal', function () {
                    if ($scope.save) {
                        /*recordsService.saveRecord($scope.recordModal, showSuccess, showError,
                            function (exercises, cardio) {
                                //añadir el nuevo poi a la lista
                            });*/
                        $scope.save = false;
                        $scope.poiModal = {
                            id: 0,
                            name: "",
                            description: "",
                            tags: "",
                            lat: 0,
                            lng: 0,
                            url: "",
                            image: "",
                            owner: ""
                        };
                    }
                });
            };

            //close record
            $scope.closePOIModal = function () {
                $scope.poiModal = {
                    id: 0,
                    name: "",
                    description: "",
                    tags: "",
                    lat: 0,
                    lng: 0,
                    url: "",
                    image: "",
                    owner: ""
                };
                $("#poiModal").modal("hide");
            };

            //POI CONTROLLER
            $scope.shortUrl = function (url) {
              console.log("SHORTED");
            };

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
