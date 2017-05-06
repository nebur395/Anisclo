angular.module('pirineoPOIApp')

    .controller('navbarCtrl', ['$scope', 'auth', function ($scope, auth) {

        $scope.home = "";
        $scope.logged = false;
        $scope.admin = false;

        // Watches to control if the user is authenticated
        $scope.$watch(function() {
            return auth.isAuthenticated();
        }, function () {
            $scope.logged = auth.isAuthenticated();
            $scope.admin = auth.isAuthenticated() && auth.getAdmin();
            $scope.home = $scope.logged ? "starter" : "login";
        });

        $scope.logout = function () {
            auth.logout();
        }
    }]);
