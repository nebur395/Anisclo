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
                } else if(auth.getAdmin()) {
                    $state.go('admin');
                } else if(auth.getFirstLogin()) {
                    $state.go('changePassword');
                }
            }
        })

        //starter screen
        .state('profile', {
            url: "/profile",
            templateUrl: "templates/profile.html",
            controller: "profileCtrl",
            onEnter: function($state, auth){
                if(!auth.isAuthenticated()){
                    $state.go('login');
                } else if(auth.getAdmin()) {
                    $state.go('admin');
                } else if(auth.getFirstLogin()) {
                    $state.go('changePassword');
                }
            }
        })

        // change password screen
        .state('changePassword', {
            url: "/changePassword",
            templateUrl: "templates/changePassword.html",
            controller: "changePasswordCtrl",
            onEnter: function($state, auth){
                if(!auth.isAuthenticated()){
                    $state.go('login');
                } else if(auth.getAdmin()) {
                    $state.go('admin');
                } else if(!auth.getFirstLogin()) {
                    $state.go('starter');
                }
            }
        })

        //login screen
        .state('retrievePassword', {
            url: "/retrievePassword",
            templateUrl: "templates/retrievePassword.html",
            controller: "retrievePasswordCtrl",
            onEnter: function($state, auth){
                if(auth.isAuthenticated()){
                    $state.go('starter');
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
