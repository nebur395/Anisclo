angular.module('pirineoPOIApp')

    .controller('userCardCtrl', ['$scope', 'Notification', 'userManagement',
        function ($scope, Notification, userManagement) {

            $scope.showCard = false;

            // FEEDBACK MESSAGES

            // show the error message
            var showError = function (message) {
                Notification.error('&#10008' + message);
            };

            // show the error message
            var showSuccess = function (message) {
                Notification.success('&#10004' + message);
            };

        }]);
