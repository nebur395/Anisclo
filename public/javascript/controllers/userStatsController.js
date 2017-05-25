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

        $scope.optionsLinealStat = {
            scales: {
                yAxes: [{
                    id: 'y-axis-1',
                    type: 'linear',
                    position: 'left',
                    ticks: {min: 0}
                }]
            }
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
        $scope.labels4Stat = [];
        $scope.data4Stat = [];
        userStats.getPoiByLocation(function (list) {
            for (i=0;i<list.length;i++) {
                $scope.labels4Stat.push(list[i].continent);
                $scope.data4Stat.push(list[i].poiNumber);
            }
        }, showError);
        $scope.options4Stat = { legend: { display: true }, responsive: true, maintainAspectRatio: false};

        // Most duplicated owned POI
        $scope.labels5Stat = [];
        $scope.data5Stat = [];
        userStats.getDuplicatedPois(function (list) {
            list.sort(function(a, b){return b.duplicated - a.duplicated});
            for (i=0;i<list.length;i++) {
                $scope.labels5Stat.push(list[i].name);
                $scope.data5Stat.push(list[i].duplicated);
            }
        }, showError);

        // Number of followers
        $scope.followers = 0;
        userStats.getFollowers(function (number) {
            $scope.followers = number;
        }, showError);

        // Longest routes by distance
        $scope.labels6Stat = [];
        $scope.data6Stat = [];
        userStats.getLongestRoutesByDistance(function (list) {
            list.sort(function(a, b){return b.length - a.length});
            for (i=0;i<list.length;i++) {
                $scope.labels6Stat.push(list[i].routeId);
                $scope.data6Stat.push(list[i].length);
            }
        }, showError);

        // Longest routes by time
        $scope.labels7Stat = [];
        $scope.data7Stat = [];
        userStats.getLongestRoutes(function (list) {
            list.sort(function(a, b){return b.duration - a.duration});
            for (i=0;i<list.length;i++) {
                $scope.labels7Stat.push(list[i].routeId);
                $scope.data7Stat.push(list[i].duration);
            }
        }, showError);

        // Number of routes with the same amount of POIs
        $scope.labels8Stat = [];
        $scope.data8Stat = [[]];
        userStats.getPoisInRoutes(function (list) {
            list.sort(function(a, b){
                var x = a.rank.toLocaleLowerCase();
                var y = b.rank.toLocaleLowerCase();
                if (x < y) {return -1;}
                if (x > y) {return 1;}
                return 0;
            });
            for (i=0;i<list.length - 1;i++) {
                $scope.labels8Stat.push(list[i].rank);
                $scope.data8Stat[0].push(list[i].routesNumber);
            }
        }, showError);


        // Most frequent transportation
        $scope.labels9Stat = [];
        $scope.data9Stat = [[]];
        $scope.options9Stat = { responsive: true, maintainAspectRatio: false,
        scale:{
            ticks:{
                beginAtZero: true
            }
        }};
        userStats.getTransportUsage(function (list) {
            for (i=0;i<list.length;i++) {
                $scope.labels9Stat.push(list[i].transport);
                $scope.data9Stat[0].push(list[i].routesNumber);
            }
        }, showError);

        // Most recreated routes
        $scope.labels10Stat = [];
        $scope.data10Stat = [];
        userStats.getMostRequestedRoutesById(function (list) {
            list.sort(function(a, b){return b.requestedNumber - a.requestedNumber});
            for (i=0;i<list.length;i++) {
                $scope.labels10Stat.push(list[i].routeId);
                $scope.data10Stat.push(list[i].requestedNumber);
            }
        }, showError);
    }]);
