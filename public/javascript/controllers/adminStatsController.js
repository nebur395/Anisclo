angular.module('pirineoPOIApp')

    .controller('adminStatsCtrl', ['$scope', 'Notification', 'adminStats',
        function ($scope, Notification, adminStats) {

            // FEEDBACK MESSAGES

            // show the error message
            var showError = function (message) {
                Notification.error('&#10008' + message);
            };

            // Number of users
            $scope.totalUsers = 0;
            adminStats.getTotalUsers(function(number){
                $scope.totalUsers = number;
            }, showError);

            // Number of pois
            $scope.totalPois = 0;
            adminStats.getTotalPois(function(number){
                $scope.totalPois = number;
            }, showError);

            // Number of routes
            $scope.totalRoutes = 0;
            adminStats.getTotalRoutes(function(number){
                $scope.totalRoutes = number;
            }, showError);

            // Accounts status
            $scope.labelsStatusChart = [];
            $scope.dataStatusChart = [];
            $scope.optionsStatusChart = {
                legend: { display: true},
                responsive: true,
                maintainAspectRatio: false
            };
            adminStats.getUsersStatus(function(status){
                for(var i=0;i<status.length;i++){
                    $scope.dataStatusChart.push(status[i].usersNumber);
                    $scope.labelsStatusChart.push(status[i].status);
                }
            });

            // Average number of pois per user
            $scope.avgPois = 0;
            adminStats.getPoisPerUser(function(number){
                $scope.avgPois = number;
            }, showError);

            // Average number of routes per user
            $scope.avgRoutes = 0;
            adminStats.getRoutesPerUser(function(number){
                $scope.avgRoutes = number;
            }, showError);

            // Evolution of last access by user
            $scope.labelsMeses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto',
                'Septiembre','Octubre','Noviembre','Diciembre'];
            $scope.dataLastLoginChart = [[0,0,0,0,0,0,0,0,0,0,0,0]];
            adminStats.getLastLogins(function(list) {
                $scope.dataLastLoginChart[0] = list;
            });

            // Evolution of signups and removes grouped by month
            $scope.dataSignUpsChart = [[0,0,0,0,0,0,0,0,0,0,0,0]];
            $scope.dataRemovesChart = [[0,0,0,0,0,0,0,0,0,0,0,0]];
            adminStats.getSignUpAndRemove(function(signups, removes) {
                $scope.dataSignUpsChart[0] = signups;
                $scope.dataRemovesChart[0] = removes;
            });
    }]);
