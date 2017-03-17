angular.module('pirineoPOIApp', ['ui.router', 'base64'])

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

        //starter screen
        .state('starter', {
            url: "/starter",
            templateUrl: "templates/starter.html",
            controller: "starterCtrl",
            onEnter: function($state, auth){
                if(!auth.isAuthenticated()){
                    $state.go('login');
                }
            }
        })

        //login screen
        .state('login', {
            url: "/login",
            templateUrl: "templates/login.html",
            controller: "loginCtrl",
            onEnter: function($state, auth){
                if(auth.isAuthenticated()){
                    $state.go('starter');
                }
            }
        })

        //sign up screen
        .state('signUp', {
            url: "/signUp",
            templateUrl: "templates/signUp.html",
            controller: "signUpCtrl",
            onEnter: function($state, auth){
                if(auth.isAuthenticated()){
                    $state.go('starter');
                }
            }
        });

        $urlRouterProvider.otherwise('login');
    });
