angular.module('pirineoPOIApp')

    .controller('favsListCtrl', ['$scope', 'auth', 'poiService', 'Notification', function ($scope, auth, poiService, Notification) {

        $scope.showCard = false;

        // FEEDBACK MESSAGES

        // show the error message
        var showError = function (message) {
            Notification.error('&#10008' + message);
        };

        // show the error message
        var showSuccess = function (message) {
            Notification.success('&#10004' + message);
        };

        $scope.poiList = [];

        $scope.isEmpty = function() {
            return $scope.poiList.length == 0;
        };

        $scope.$on('$viewContentLoaded', function(){
            var pois = auth.getFavs();
            console.log(pois);
            for(var i=0;i<pois.length;i++){
                console.log(pois[i]);
                poiService.getPoi(pois[i],function (poi) {
                    $scope.poiList.push(poi);
                }, showError);
            }
            console.log($scope.poiList);
        });
    }]);
