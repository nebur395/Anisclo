angular.module('pirineoPOIApp')

    .controller('profileCtrl', ['$scope', '$state', 'auth',
        function ($scope, $state, auth) {
            $scope.name = auth.getUsername();
            $scope.lastname = auth.getLastname();
            $scope.email = auth.getEmail();
        }]);
