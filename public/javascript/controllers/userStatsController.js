angular.module('pirineoPOIApp')

    .controller('userStatsCtrl', ['$scope', 'Notification', 'userStats', function ($scope, Notification, userStats) {
        // FEEDBACK MESSAGES

        // show the error message
        var showError = function (message) {
            Notification.error('&#10008' + message);
        };

        // show the error message
        var showSuccess = function (message) {
            Notification.success('&#10004' + message);
        };

        // Most rated owned POI
        $scope.labels1Stat = [];
        $scope.data1Stat = [];
        userStats.getMostRated(function (list) {
            list.sort(function(a, b){return b.rating - a.rating});
            for (i=0;i<list.length;i++) {
                $scope.labels1Stat.push(list[i].name);
                $scope.data1Stat.push(list[i].rating);
            }
        }, showError);

        // Most favorite owned POI
        $scope.labels2Stat = [];
        $scope.data2Stat = [];
        userStats.getMostFavorite(function (list) {
            list.sort(function(a, b){return b.favNumber - a.favNumber});
            for (i=0;i<list.length;i++) {
                $scope.labels2Stat.push(list[i].name);
                $scope.data2Stat.push(list[i].favNumber);
            }
        }, showError);

        // Evolution of POIs creation date
        $scope.labels3Stat = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto',
            'Septiembre','Octubre','Noviembre','Diciembre'];
        $scope.data3Stat = [[0,0,0,0,0,0,0,0,0,0,0,0]];
        userStats.getPoiByDate(function (list) {
            list.sort(function(a, b){return a.creationDate - b.creationDate });
            for (i=0;i<list.length - 1;i++) {
                var currentMonth = list[i].creationDate;
                var count = 1;
                while ((i< (list.length - 1)) && (currentMonth == list[i+1].creationDate)) {
                    count++;
                    i++;
                }
                $scope.data3Stat[0][currentMonth - 1] = count;
            }
        }, showError);


        // Most POI-populated location
        $scope.labels4Stat = ['América','Asia','Europa','África','Oceanía','Antártida'];
        $scope.data4Stat = [10,5,100,8,10,1];
        $scope.options4Stat = { legend: { display: true }, responsive: true, maintainAspectRatio: false};

        // Most duplicated owned POI
        $scope.labels5Stat = ['poi1', 'poi2', 'poi3', 'poi4', 'poi5'];
        $scope.data5Stat = [25,20,15,10,5];

        // Number of followers
        $scope.follows = 0;

        // Longest routes by distance
        $scope.labels6Stat = ['poi1', 'poi2', 'poi3', 'poi4', 'poi5'];
        $scope.data6Stat = [400,350,300,300,200];

        // Longest routes by time
        $scope.labels7Stat = ['poi1', 'poi2', 'poi3', 'poi4', 'poi5'];
        $scope.data7Stat = [23,20,15,10,2];

        // Number of routes with the same amount of POIs
        $scope.data8Stat = [[
            {
                x: 2,
                y: 20},
            {
                x: 3,
                y: 10},
            {
                x: 5,
                y: 1}]];
        $scope.options8Stat = {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            }
        };

        // Longest routes by time
        $scope.labels9Stat = ['En coche ', 'Transporte público', 'A pie', 'En bicicleta'];
        $scope.data9Stat = [65,100,81,70];
        $scope.options9Stat = { responsive: true, maintainAspectRatio: false};

        // Most recreated routes
        $scope.labels10Stat = ['poi1', 'poi2', 'poi3'];
        $scope.data10Stat = [23,20,15];
    }]);
