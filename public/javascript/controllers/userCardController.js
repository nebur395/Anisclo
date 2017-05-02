angular.module('pirineoPOIApp')

    .controller('userCardCtrl', ['$scope', 'Notification', 'userManagement',
        function ($scope, Notification, userManagement) {

            $scope.showCard = false;
            $scope.editing = false;

            // FEEDBACK MESSAGES

            // show the error message
            var showError = function (message) {
                Notification.error('&#10008' + message);
            };

            // show the error message
            var showSuccess = function (message) {
                Notification.success('&#10004' + message);
            };

            $scope.modalButton = 0;
            $scope.modalSubmit = function () {
                switch ($scope.modalButton) {
                    case 0:
                        showSuccess("0");
                        break;
                    case 1:
                        showSuccess("1");
                        break;
                    case 2:
                        showSuccess("2");
                        break;
                    case 3:
                        $scope.editing = !$scope.editing;
                        break;
                    default:
                        showSuccess("4");
                }
            };

        }]);
