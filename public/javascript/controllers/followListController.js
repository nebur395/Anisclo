angular.module('pirineoPOIApp')

    .controller('followListCtrl', ['$scope', 'auth', 'poiService', 'Notification', function ($scope, auth, poiService, Notification) {

        // show the error message
        var showError = function (message) {
            Notification.error('&#10008' + message);
        };

        // show the error message
        var showSuccess = function (message) {
            Notification.success('&#10004' + message);
        };



        $scope.allPoiList = [];
        $scope.poiList = [];

        $scope.$on('$viewContentLoaded', function(){
            var follows = auth.getFollows();
            poiService.getListOfPOIs(function (dataPOIs) {
                $scope.allPoiList = dataPOIs;
                var index = 0;
                // Checking every user
                for(var i=0;i<follows.length;i++){
                    // Looking for every poi from that user
                    for(var j=0;j<$scope.allPoiList.length;j++){
                        // Save only pois from users in follows
                        if($scope.allPoiList[j].owner == follows[i]){
                            $scope.poiList[index] = $scope.allPoiList[j];
                            index++;
                        }
                    }
                }
            }, showError);

        });

    }]);
