angular.module('pirineoPOIApp')

    .controller('adminManagementCtrl', ['$scope', 'Notification', 'userManagement',
        function ($scope, Notification, userManagement) {

        // FEEDBACK MESSAGES

        // show the error message
        var showError = function (message) {
            Notification.error('&#10008' + message);
        };

        // show the error message
        var showSuccess = function (message) {
            Notification.success('&#10004' + message);
        };

        $scope.userList = [];

        $scope.isEmpty = function() {
            return $scope.userList.length == 0;
        };

        // get the user list
        userManagement.getUsers(function (data) {
            $scope.userList = data;
        }, showError);
    }]);
