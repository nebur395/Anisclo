angular.module('pirineoPOIApp')

    .controller('loginCtrl', ['$scope', '$state', 'auth',
        function ($scope, $state, auth) {
            // inputs visual variables
            $scope.email = "";
            $scope.password = "";

            // feedback handling variables
            $scope.errorMsg = "";
            $scope.error = false;

            // hide the error login message when is true respectively
            $scope.hideError = function () {
                $scope.errorMsg = "";
                $scope.error = false;
            };

            // show the error login message when is false respectively
            var showError = function (error) {
                $scope.errorMsg = error;
                $scope.error = true;
            };

            // send the login form to the auth service
            $scope.login = function () {
                // Standard 'authorization basic'
                auth.login($scope.email, $scope.password, showError);
            };
        }]);
