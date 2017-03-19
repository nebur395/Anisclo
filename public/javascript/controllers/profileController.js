angular.module('pirineoPOIApp')

    .controller('profileCtrl', ['$scope', '$state', 'auth', 'settings',
        function ($scope, $state, auth, settings) {
            $scope.name = auth.getUsername();
            $scope.lastname = auth.getLastname();
            $scope.email = auth.getEmail();
            $scope.currentPass = "";
            $scope.newPass = "";
            $scope.delete = false;

            // FEEDBACK MESSAGES

            // feedback handling variables
            $scope.error = false;
            $scope.success = false;
            $scope.successMsg = "";
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

            // show the success mensage
            var showSuccess = function (message) {
                $scope.successMsg = message;
                $scope.success = true;
            };

            // hide the success mensage
            $scope.hideSuccess = function () {
                $scope.success = false;
                $scope.successMsg = "";
            };

            $scope.settings = function () {
                if ($scope.delete) {
                    settings.deleteAccount($scope.email, $scope.currentPass, showError);
                } else {
                    var passwords = {
                        current: $scope.currentPass,
                        new: $scope.newPass
                    };
                    settings.changePassword($scope.email, passwords, showSuccess, showError);
                }
            }
        }]);
