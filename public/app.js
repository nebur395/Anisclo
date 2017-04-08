angular.module('pirineoPOIApp', ['ui.router', 'base64', 'vcRecaptcha', 'uiGmapgoogle-maps'])

    .config(function(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'API KEY HERE',
            v: '3', //defaults to latest 3.X anyhow
            libraries: 'geometry,visualization'
        });
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

        //starter screen
        .state('starter', {
            url: "/starter",
            templateUrl: "templates/starter.html",
            controller: "starterCtrl",
            onEnter: function($state, manageState){
                var correctState = manageState.manageLoggedState("starter");
                if (correctState != "starter") {
                    $state.go(correctState);
                }
            }
        })

        //starter screen
        .state('profile', {
            url: "/profile",
            templateUrl: "templates/profile.html",
            controller: "profileCtrl",
            onEnter: function($state, manageState){
                var correctState = manageState.manageLoggedState("profile");
                if (correctState != "profile") {
                    $state.go(correctState);
                }
            }
        })

        // change password screen
        .state('changePassword', {
            url: "/changePassword",
            templateUrl: "templates/changePassword.html",
            controller: "changePasswordCtrl",
            onEnter: function($state, manageState){
                var correctState = manageState.manageLoggedState("changePassword");
                if (correctState != "changePassword") {
                    $state.go(correctState);
                }
            }
        })

        //login screen
        .state('retrievePassword', {
            url: "/retrievePassword",
            templateUrl: "templates/retrievePassword.html",
            controller: "retrievePasswordCtrl",
            onEnter: function($state, manageState){
                var correctState = manageState.manageNotLoggedState("retrievePassword");
                if (correctState != "retrievePassword") {
                    $state.go(correctState);
                }
            }
        })

        //login screen
        .state('login', {
            url: "/login",
            templateUrl: "templates/login.html",
            controller: "loginCtrl",
            onEnter: function($state, manageState){
                var correctState = manageState.manageNotLoggedState("login");
                if (correctState != "login") {
                    $state.go(correctState);
                }
            }
        })

        //sign up screen
        .state('signUp', {
            url: "/signUp",
            templateUrl: "templates/signUp.html",
            controller: "signUpCtrl",
            onEnter: function($state, manageState){
                var correctState = manageState.manageNotLoggedState("signUp");
                if (correctState != "signUp") {
                    $state.go(correctState);
                }
            }
        });

        $urlRouterProvider.otherwise('login');
    });
