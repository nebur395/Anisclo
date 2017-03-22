angular.module('pirineoPOIApp')

    .controller('navbarCtrl', ['$scope', 'auth', function ($scope, auth) {

        $scope.home = "";
        $scope.logged = false;

        // Watches to control if the user is authenticated
        $scope.$watch(function() {
            return auth.isAuthenticated();
        }, function () {
            $scope.logged = auth.isAuthenticated();
            $scope.home = $scope.logged ? "starter" : "login";
        });

        $scope.logout = function () {
            auth.logout();
        }
    }]);
