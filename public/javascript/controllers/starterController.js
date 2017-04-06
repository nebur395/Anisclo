angular.module('pirineoPOIApp')

    .controller('starterCtrl', ['$scope', '$state', 'auth', 'uiGmapGoogleMapApi',
        function ($scope, $state, auth, uiGmapGoogleMapApi) {
            $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };
            $scope.options = { scrollwheel: false };

            uiGmapGoogleMapApi.then(function(maps) {


            });
    }]);
