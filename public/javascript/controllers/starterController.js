angular.module('pirineoPOIApp')

    .controller('starterCtrl', ['$scope', '$state', 'auth', 'uiGmapGoogleMapApi', 'poiService', 'urlService',

        function ($scope, $state, auth, uiGmapGoogleMapApi, poiService, urlService) {

            $scope.poiList = [];

            poiService.getListOfPOIs(function (dataPOIs) {
                $scope.poiList = dataPOIs;
            });
            $scope.emptyPoiList = function () {
              return $scope.poiList.length == 0;
            };

            // FEEDBACK MESSAGES

            // feedback handling variables
            $scope.error = false;
            $scope.errorMsg = "";

            // hide the error mensage
            $scope.hideError = function () {
                $scope.errorMsg = "";
                $scope.error = false;
            };
            // show the error mensage
            var showError = function (error) {
                $scope.errorMsg = error;
                $scope.error = true;
            };

            // MODAL POI SECTION

            $scope.poiModal = {    // temporal POI data on modals
                _id: "",
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
                $scope.hideError();
                $scope.poiModal = {
                    _id: poi._id,
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

            $scope.modalButton = 0;
            $scope.modalSubmit = function () {
                switch ($scope.modalButton) {
                    case 0:
                        $scope.closePOIModal();
                        break;
                    case 1:
                        $scope.deletePOI();
                        break;
                    case 2:
                        $scope.duplicatePOI();
                        break;
                    default:
                        $scope.savePOI();
                }
            };

            // save record
            $scope.savePOI = function () {
                if ($scope.poiModal._id == "") { // It is a new POI
                    poiService.addPoi($scope.poiModal,
                        function (poi) {
                            $scope.poiList.push(poi);
                            var marker= {};
                            marker.coords = {};
                            marker.coords.latitude = poi.lat;
                            marker.coords.longitude = poi.lng;
                            console.log("Saving marker: " + marker.coords.latitude + " ; " + marker.coords.longitude);
                            $scope.map.markers.push(marker);
                            $scope.closePOIModal();
                        }, showError);
                } else { // It is an existing POI
                    poiService.modifyPoi($scope.poiModal,
                        function (poi) {
                            $scope.closePOIModal();

                            console.log("modifying poi: "+poi._id);
                            var index = $scope.poiList.map(function(tmp) {return tmp._id;}).indexOf(poi._id);

                            console.log("found poi in poilist: "+$scope.poiList[index]._id);
                            // TODO: A PARTIR DE AQUI NO SE SI FUNCIONA, PROBAR CUANDO FUNCIONE LO DE ARRIBA
                            /*for(var j=0;j<$scope.map.markers.length;j++){
                             //var markerOriginal = $scope.map.markers.pop();
                             if($scope.map.markers[j].coords.lat == $scope.poiList[i].lat && $scope.map.markers[j].coords.lng == $scope.poiList[i].lng){
                             console.log("changing marker location for poi");
                             var marker = {
                             coords: {
                             latitude: poi.lat,
                             longitude: poi.lng
                             }
                             };
                             $scope.map.markers[j] = marker;
                             //$scope.map.markers.push(marker);
                             }
                             //else $scope.map.markers.push(markerOriginal);
                             }*/
                            //TODO DARÍO: BORRAR EL POI ANTERIOR ($scope.poiList[index]) Y PINTAR EL NUEVO (poi)
                            $scope.poiList[index] = poi;
                            //$scope.$apply();
                        }, showError);
                }
            };

            // duplicate poi
            $scope.duplicatePOI = function () {
                poiService.duplicatePoi($scope.poiModal,
                    function (poi) {
                        $scope.poiList.push(poi);
                        $scope.closePOIModal();
                    }, showError);
            };

            // delete poi
            $scope.deletePOI = function () {
                poiService.deletePoi($scope.poiModal,
                    function (poi) {
                        $scope.closePOIModal();

                        //TODO DARÍO: BORRAR EL MARKER DEL POI (POI)
                        var index = $scope.poiList.map(function(tmp) {return tmp._id;}).indexOf(poi._id);
                        $scope.poiList.splice(index, 1);
                    }, showError);
            };

            //close record
            $scope.closePOIModal = function () {
                $scope.poiModal = {
                    _id: "",
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

            // POI CONTROLLER
            $scope.shortUrl = function (url) {
                urlService.shortUrl(url, function (shorted) {
                  $scope.poiModal.url = shorted;
              }, showError);
            };

            $scope.ownedPoi = function (email) {
                return auth.getEmail() == email;
            };

            $scope.searchPOIs = function () {
                poiService.search($scope.searhedTags, function (pois) {
                    $scope.poiList = dataPOIs;
                    //TODO DARÍO: VOLVER A PINTAR LA LISTA DE POIS TRAS LA BÚSQUEDA
                });
            };

            // MAP SECTION

            $scope.map = {
                center: {latitude: 45, longitude: -73}, zoom: 8,

                markers: [],
                markersEvents: {
                    click: function(marker, eventName, model, eventArgs){
                        var e = marker.getPosition();
                        var poi;
                        console.log("esto es el poi:"+e);
                        for(var i=0;i<$scope.poiList.length;i++){
                            if($scope.poiList[i].lat == e.lat() && $scope.poiList[i].lng == e.lng()){
                                poi = $scope.poiList[i];
                                console.log("encontrado poi: "+poi.lat+" ; "+poi.lng);
                                break;
                            }
                        }
                        $scope.openPOIModal(poi);
                    }
                },
                events: {
                    click: function (mapModel, eventName, originalEventArgs) {
                        $scope.$apply(function () {
                            var e = originalEventArgs[0];
                            var poi = {
                                _id: "",
                                name: "",
                                description: "",
                                tags: "",
                                lat: e.latLng.lat(),
                                lng: e.latLng.lng(),
                                url: "",
                                image: "",
                                owner: ""
                            };
                            $scope.openPOIModal(poi);
                        });
                    }
                }
            };
            $scope.options = {scrollwheel: false, streetViewControl: false, mapTypeControl: false};
            uiGmapGoogleMapApi.then(function (maps) {
                var marker = {};
                marker.coords = {};
                for(var i=0; i<$scope.poiList.length; i++){
                    marker.coords.latitude = $scope.poiList[i].lat;
                    marker.coords.longitude = $scope.poiList[i].lng;
                    console.log("painting marker: " + marker.coords.latitude + " ; " + marker.coords.longitude);
                    $scope.map.markers.push(marker);
                    marker = {};
                    marker.coords = {};
                }
            });

        }]);
