angular.module('pirineoPOIApp')

    .controller('loginCtrl', ['$scope', '$state', 'auth', '$auth', 'Notification',
        function ($scope, $state, auth, $auth, Notification) {

            // show the error message
            var showError = function (message) {
                Notification.error('&#10008' + message);
            };

            // show the error message
            var showSuccess = function (message) {
                Notification.success('&#10004' + message);
            };

            //Google login code
            $scope.authenticate = function(provider) {
                $auth.authenticate(provider)
                    .then(function(response){ //si lo hace bien
                        console.log(response);
                        console.log("todo bien");
                        //TODO: login
                        console.log(response.data.google);
                        auth.login(response.data.email, response.data.google, true, showError);
                    })
                    .catch(function(response){ //si lo hace mal
                        console.log(response);
                        showError("Error al iniciar sesión. " +
                            "\nEs posible que ese email ya esté registrado");
                    });
            };

            // inputs visual variables
            $scope.name = "";
            $scope.lastname = "";
            $scope.email = "";
            $scope.recaptchaResponse;


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
                auth.login($scope.email, $scope.password, false, showError);
            };
        }]);
