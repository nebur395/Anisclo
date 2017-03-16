angular.module('pirineoPOIApp')

    .controller('navbarCtrl', ['$scope', 'auth', function ($scope, auth) {

        $scope.logged = function () {
            return false;
        };

        $scope.logout = function () {
            auth.logout();
        }
    }]);
