angular.module('pirineoPOIApp')

    // include the 'navbar.html' into the <navbar> tag
    .directive('navbar', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/components/navbar.html',
            controller: 'navbarCtrl',
            scope: {}
        }
    })

    // include the 'popover' into the <popover> attribute
    .directive('popover', function($compile){
        return {
            restrict : 'A',
            link : function(scope, elem){

                var content = $("#popover-content").html();
                var compileContent = $compile(content)(scope);
                var options = {
                    content: compileContent,
                    html: true
                };

                $(elem).popover(options);
            }
        }
    })

    // include the 'favsList.html' into the <poiCard> tag
    .directive('favCards', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/components/cards.html',
            controller: 'favsListCtrl',
            scope: true
        }
    });

