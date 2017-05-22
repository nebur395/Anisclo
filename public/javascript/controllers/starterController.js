angular.module('pirineoPOIApp')

    .controller('starterCtrl', ['$scope', '$state', 'auth', 'uiGmapGoogleMapApi', 'poiService', 'urlService',
        'settings', 'Notification', '$sce', 'routesService',

        function ($scope, $state, auth, uiGmapGoogleMapApi, poiService, urlService, settings,
                  Notification, $sce, routesService) {

            $scope.poiList = [];
            $scope.firstLoad;
            $scope.esJson = 1;
            $scope.esJsonEmail = 1;

            // FEEDBACK MESSAGES

            // show the error message
            var showError = function (message) {
                Notification.error('&#10008' + message);
            };

            // show the error message
            var showSuccess = function (message) {
                Notification.success('&#10004' + message);
            };

            poiService.getListOfPOIs(function (dataPOIs) {
                $scope.poiList = dataPOIs;
            }, showError);
            $scope.emptyPoiList = function () {
              return $scope.poiList.length == 0;
            };
            //Return the marker for lat lng given
            $scope.findMarker = function(lat,lng){
                for(var i=0;i<$scope.map.markers.length;i++){
                    if($scope.map.markers[i].coords.latitude == lat
                        && $scope.map.markers[i].coords.longitude == lng){
                        return $scope.map.markers[i];
                    }
                }
            };

            // IMAGE SECTION

            $scope.newImage = function(e){
                var file    = e.target.files[0];
                var reader  = new FileReader();

                reader.onloadend = function () {
                    //parse metadata
                    var data_url = reader.result;
                    var matches = data_url.match(/^data:.+\/(.+);base64,(.*)$/);
                    var data = matches[2]; //keep only base64 data
                    $scope.poiModal.image = data;
                    $scope.$apply();
                };

                if (file) {
                    if(file.name.toUpperCase().includes(".JPG") || file.name.toUpperCase().includes(".PNG")){
                        reader.readAsDataURL(file);
                    }
                    else showError("Formato de imagen inválido. Por favor envía una imagen JPG o PNG.");

                } else {
                    //$scope.poiModal.image = "";
                    showError("Error inesperado, inténtelo de nuevo");
                }
            };

            // RATE SECTION

            $scope.valorarPOI = function(){
                //$scope.valorar = poiService.getRate($scope.poiModal);
                $scope.valorar;
            };

            $scope.newRate = function(event){
                poiService.ratePoi($scope.poiModal,event.target.value, showSuccess, showError);
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
                    case 4:
                        $scope.map.center.latitude= $scope.poiModal.lat;
                        $scope.map.center.longitude= $scope.poiModal.lng;
                        showSuccess("Mapa centrado en "+$scope.poiModal.name);
                        $scope.closePOIModal();
                        break;
                    default:
                        $scope.savePOI();
                }
            };

            // save record
            $scope.savePOI = function () {
                if ($scope.poiModal._id == "") { // It is a new POI
                    poiService.addPoi($scope.poiModal, $scope.esJson,
                        function (poi, message) {
                            $scope.poiList.push(poi);
                            var marker= {};
                            marker.coords = {};
                            marker.coords.latitude = poi.lat;
                            marker.coords.longitude = poi.lng;
                            $scope.map.markers.push(marker);
                            $scope.closePOIModal();
                            showSuccess(message);
                        }, showError);
                } else { // It is an existing POI
                    poiService.modifyPoi($scope.poiModal,
                        function (poi, message) {
                            $scope.closePOIModal();
                            var index = $scope.poiList.map(function(tmp) {return tmp._id;}).indexOf(poi._id);
                            for(var j=0;j<$scope.map.markers.length;j++){
                                //if found marker, change location
                                 if($scope.map.markers[j].coords.latitude == $scope.poiList[index].lat
                                     && $scope.map.markers[j].coords.longitude == $scope.poiList[index].lng){
                                     var marker = {
                                     coords: {
                                     latitude: poi.lat,
                                     longitude: poi.lng
                                     }
                                 };
                                 $scope.map.markers[j] = marker;
                                 }
                             }
                             //center map in poi
                            $scope.map.center.latitude= poi.lat;
                            $scope.map.center.longitude= poi.lng;
                            $scope.poiList[index] = poi;
                            $scope.paintMarkers(); //To make sure the edit applies
                            showSuccess(message);
                        }, showError);
                }
            };

            // duplicate poi
            $scope.duplicatePOI = function () {
                poiService.duplicatePoi($scope.poiModal,
                    function (poi, message) {
                        $scope.poiList.push(poi);
                        $scope.closePOIModal();
                        showSuccess(message);
                    }, showError);
            };

            // delete poi
            $scope.deletePOI = function () {
                if(auth.getFavs().indexOf($scope.poiModal._id) != -1){
                    $scope.favPoi($scope.poiModal._id);
                }
                poiService.deletePoi($scope.poiModal,
                    function (poi, message) {
                        $scope.closePOIModal();
                        var del = $scope.poiList.map(function(tmp) {return tmp._id;}).indexOf(poi._id);
                        $scope.poiList.splice(del, 1);
                        $scope.map.markers = $scope.poisToMarker($scope.poiList);
                        $scope.paintMarkers();
                        showSuccess(message);
                    }, showError);
            };

            //close record
            $scope.closePOIModal = function () {
                $scope.valorar = "";
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

            $scope.poisToMarker = function(pois){
                var markers = [];
                for(var i=0;i<pois.length;i++){
                    var marker = {
                        coords: {
                            latitude: pois[i].lat,
                            longitude: pois[i].lng
                        }
                    };
                    markers.push(marker);
                }
                return markers;
            };

            $scope.searchPOIs = function () {
                if ($scope.searchedTags.trim() == "" ) {
                    poiService.getListOfPOIs(function (dataPOIs) {
                        //in case of blank search, restore all markers
                            $scope.map.markers = $scope.poisToMarker(dataPOIs);
                            $scope.poiList = dataPOIs;
                    }, showError);
                } else {
                    poiService.search($scope.searchedTags, function (pois) {
                        $scope.poiList = pois;
                        $scope.map.markers = $scope.poisToMarker(pois);

                    }, showError);
                }
            };

            // POI's owner user follow/unfollow SECTION
            // Watches to control if the user have selected a location
            $scope.followText = "Seguir usuario";
            $scope.$watch('poiModal', function () {
                if ($scope.poiModal._id != "") {
                    var follows = auth.getFollows();
                    if(follows != undefined){
                        var index = follows.indexOf($scope.poiModal.owner);
                        if (index != -1) {
                            $scope.followText = "Dejar de seguir";
                        } else {
                            $scope.followText = "Seguir usuario";
                        }
                    }

                }
            });

            $scope.followUser = function () {
                settings.followUser($scope.poiModal.owner,function(message) {
                    var follows = auth.getFollows();
                    var index = follows.indexOf($scope.poiModal.owner);
                    if (index != -1) {
                        $scope.followText = "Dejar de seguir";
                    } else {
                        $scope.followText = "Seguir usuario";
                    }
                    showSuccess(message);
                },showError);
            };

            // POI ASSESSMENT
            $scope.isFav = function (id) {
              var favs = auth.getFavs();
              if(favs != undefined){
                  var index = favs.indexOf(id);
                  return index != -1;
              }
            };

            $scope.favPoi = function (id) {
                settings.favPoi(id, showSuccess, showError);
            };

            //ROUTES SECTION
            $scope.poisInRoute = [];
            $scope.gpsInfo = [];
            $scope.routeSteps = [];
            $scope.currentIdRoute = "";
            $scope.travelMode = 'DRIVING';
            $scope.editingRoute = true; //true if user is editing a new route
            /**
             *
             * @param poisReq: Array[POI]
             * @param travelModeReq: 'DRIVING' OR 'WALKING' OR 'BICYCLING' OR 'TRANSIT'
             */
            $scope.paintRoute = function(poisReq, travelModeReq, callback){
                var waypointsReq = [];
                for(var i=1;i<(poisReq.length -1);i++) {
                    waypointsReq.push(
                        {
                            location: new google.maps.LatLng(poisReq[i].lat, poisReq[i].lng)
                        }
                    );
                }
                var request = {
                    origin: {lat: poisReq[0].lat, lng: poisReq[0].lng},
                    destination: {lat: poisReq[poisReq.length-1].lat,
                        lng: poisReq[poisReq.length-1].lng},
                    travelMode: travelModeReq,
                    waypoints : waypointsReq,
                    optimizeWaypoints: true
                };
                $scope.directionsService.route(request,function(response,status){
                    if (status === google.maps.DirectionsStatus.OK) {
                        $scope.gpsInfo = response.routes[0].legs;
                        for (i=0;i<response.routes[0].legs.length;i++) {
                            for (j=0;j<response.routes[0].legs[i].steps.length;j++) {
                                var renderedHtml = $sce.trustAsHtml(response.routes[0].legs[i].steps[j].instructions);
                                $scope.routeSteps.push(renderedHtml);
                            }
                        }
                        $scope.directionsDisplay.setDirections(response);
                        $scope.directionsDisplay.setMap($scope.map.control.getGMap());
                        if (callback) {
                            callback();
                        }
                    } else {
                        showError('Google route unsuccessful!');
                    }
                })
            };

            // Reset the actual route and infogps in order to create a new one
            $scope.makeNewRoute = function () {
                //esto debería borrar la ruta que habia pintada
                $scope.directionsDisplay.setMap(null);
                $scope.poisInRoute = [];
                $scope.editingRoute = true;
                $scope.gpsInfo = [];
                $scope.routeSteps = [];
                $scope.currentIdRoute = "";
                $scope.sendRouteEmail = "";
            };

            // Makes a route with the current drag&drop POIs
            $scope.makeRoute = function () {
                if ($scope.poisInRoute.length > 0) {
                    $scope.paintRoute($scope.poisInRoute,$scope.travelMode, function () {
                        $scope.editingRoute = false;
                        var routeTemp = {
                            userEmail: auth.getEmail(),
                            travelMode: $scope.travelMode,
                            routeInfo: $scope.gpsInfo,
                            routePOIs: $scope.poisInRoute
                        };
                        routesService.saveRoute(routeTemp, function (idRoute) {
                            $scope.currentIdRoute = idRoute;
                            showSuccess('Ruta creada correctamente');
                        }, showError);
                    });
                } else {
                    showError('No se han incluido POIs a la ruta que se intenta crear.');
                }
            };
            $scope.routeByID = function () {
                routesService.findRoute($scope.routeID, function (data) {
                    //Call paintRoute with the desired pois
                    $scope.paintRoute(data.routePOIs, data.travelMode);
                    $scope.currentIdRoute = $scope.routeID;
                    showSuccess('Ruta generada a partir del ID correctamente.');
                    $scope.editingRoute = false;
                }, showError);
            };
            $scope.sendRoute = function () {
                var emailsTemp = {
                    ownerEmail: auth.getEmail(),
                    receiverEmail: $scope.sendRouteEmail
                };
                routesService.sendRouteByEmail($scope.currentIdRoute, emailsTemp, $scope.esJsonEmail, showSuccess, showError);
            };

            // MAP SECTION

            $scope.map = {
                control: {},
                center: {latitude: 42.55870726267185, longitude: 0.050683021545410156}, zoom: 8,
                options: {scrollwheel: true, streetViewControl: false, mapTypeControl: false, minZoom: 3},
                markers: [],
                markersEvents: {
                    click: function(marker, eventName, model, eventArgs){
                        var e = marker.getPosition();
                        var poi;
                        for(var i=0;i<$scope.poiList.length;i++){
                            if($scope.poiList[i].lat == e.lat() && $scope.poiList[i].lng == e.lng()){
                                poi = $scope.poiList[i];
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
                    },
                    //So it tries to load whenever tiles change, but it will only do if it's the first load
                    //This is to prevent the markers not loading when changing view bug
                    tilesloaded: function(){
                        if($scope.firstLoad==true){
                            $scope.firstLoad= false;
                            $scope.paintMarkers();
                        }
                    }
                }

            };
            // Paint all markers
            $scope.paintMarkers = function(){
                var marker = {};
                marker.coords = {};
                for(var i=0; i<$scope.poiList.length; i++){
                    marker.coords.latitude = $scope.poiList[i].lat;
                    marker.coords.longitude = $scope.poiList[i].lng;
                    $scope.map.markers.push(marker);
                    marker = {};
                    marker.coords = {};
                }
            };
            //Execute this code when view is loaded
            $scope.$on('$viewContentLoaded', function(){

                uiGmapGoogleMapApi.then(function (maps) {
                    $scope.firstLoad = true;
                    $scope.directionsService = new maps.DirectionsService;
                    $scope.directionsDisplay = new maps.DirectionsRenderer;
                });
            });
        }]);
