angular.module('pirineoPOIApp')

    .controller('changePasswordCtrl', ['$scope', '$state', 'auth',
        function ($scope, $state, auth) {
            $scope.password = "";
            $scope.rePassword = "";
            $scope.currentPassword = "";

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

            $scope.changePassword = function() {
                if ($scope.password != $scope.rePassword) {
                    showError('Las contraseñas no coinciden');
                } else {
                    var aux = {
                        current: $scope.currentPassword,
                        new: $scope.password
                    };
                    auth.changePassword(aux, auth.getEmail(), showError);
                }
            }
        }]);
