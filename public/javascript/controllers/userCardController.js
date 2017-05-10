angular.module('pirineoPOIApp')

    .controller('userCardCtrl', ['$scope', 'Notification', 'userManagement',
        function ($scope, Notification, userManagement) {

            $scope.showCard = false;
            $scope.editing = false;
            $scope.currentEmail = $scope.user.email;
            $scope.isActive = $scope.user.isActive;
            $scope.isBanned = $scope.user.ban >= 0;
            $scope.esJson = 'true';

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
                    case 0: // ban a user
                        var time = {
                            time: $scope.user.ban
                        };
                        userManagement.banUser(time, $scope.currentEmail, function (message) {
                            $scope.isBanned = $scope.user.ban >= 0;
                            showSuccess(message);
                        }, showError);
                        break;
                    case 1: // unban a user
                        userManagement.unBanUser($scope.currentEmail, function (message) {
                            $scope.user.ban = -1;
                            $scope.isBanned = $scope.user.ban >= 0;
                            showSuccess(message);
                        }, showError);
                        break;
                    case 2: // activate a user
                        userManagement.useDragonBalls($scope.currentEmail, function (message) {
                            $scope.user.isActive = true;
                            $scope.isActive = $scope.user.isActive;
                            showSuccess(message);
                        }, showError);
                        break;
                    case 3:
                        $scope.editing = !$scope.editing;
                        break;
                    default: // save and modify a user
                        var user = {
                            name: $scope.user.name,
                            lastname: $scope.user.lastname,
                            newEmail: $scope.user.email
                        };
                        userManagement.setUser(user, $scope.currentEmail, $scope.esJson, function (message) {
                            $scope.currentEmail = $scope.user.email;
                            $scope.editing = !$scope.editing;
                            showSuccess(message);
                        }, showError);
                }
            };

            $scope.$watch('user.ban', function () {
                if ($scope.user.ban < 0) {
                    $scope.user.ban = 0;
                } else if ($scope.user.ban === null) {
                    $scope.user.ban = 0;
                }
            });

        }]);
