angular.module('pirineoPOIApp')

    .controller('userStatsCtrl', ['$scope', function ($scope) {

        // Most rated owned POI
        $scope.labels1Stat = ['poi1', 'poi2', 'poi3', 'poi4', 'poi5'];
        $scope.data1Stat = [25,20,15,10,5];

        // Most favorite owned POI
        $scope.labels2Stat = ['poi1', 'poi2', 'poi3', 'poi4', 'poi5'];
        $scope.data2Stat = [10,8,7,4,1];

        // Evolution of POIs creation date
        $scope.labels3Stat = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto',
            'Septiembre','Octubre','Noviembre','Diciembre'];
        $scope.data3tat = [1,5,3,3,9,12,20,15,17,13,10,5];

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
