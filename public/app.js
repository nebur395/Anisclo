angular.module('pirineoPOIApp', ['ui.router', 'base64', 'vcRecaptcha', 'uiGmapgoogle-maps', 'dndLists',
                                'ui-notification', 'ngSanitize', 'chart.js', 'satellizer', 'angular-jwt'])

    // Config UI-Google-maps angularjs module
    .config(function(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyCzuYo95Y83vG0jLpI97fC8Rfw1pgRuq7U',
            v: '3', //defaults to latest 3.X anyhow
            libraries: 'geometry,visualization'
        });
    })

    // Config UI-Notification angularjs module
    .config(function(NotificationProvider) {
        NotificationProvider.setOptions({
            positionX: 'center',
            maxCount: 4
        });
    })

    // config login google
    .config(function($authProvider){

        $authProvider.httpInterceptor = function() { return true; };
        $authProvider.withCredentials = false;
        $authProvider.tokenRoot = null;
        $authProvider.baseUrl = '/';
        $authProvider.loginUrl = '/auth/login';
        $authProvider.signupUrl = '/auth/signup';
        $authProvider.unlinkUrl = '/auth/unlink/';
        $authProvider.tokenName = 'token';
        $authProvider.tokenPrefix = 'satellizer';
        $authProvider.tokenHeader = 'Authorization';
        $authProvider.tokenType = 'Bearer';
        $authProvider.storageType = 'localStorage';
        $authProvider.google({
            clientId: '455009480567-lhd272hs4et03dj9g4vmltt9rurhcrtg.apps.googleusercontent.com',
            url: 'users/google',
            authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
            redirectUri: window.location.origin,
            requiredUrlParams: ['scope'],
            optionalUrlParams: ['display'],
            scope: ['profile', 'email'],
            scopePrefix: 'openid',
            scopeDelimiter: ' ',
            display: 'popup',
            oauthType: '2.0',
            popupOptions: { width: 452, height: 633 }
        })
    })

    .config(function ($stateProvider, $urlRouterProvider) {
        $stateProvider

        // starter screen
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

        // profile screen
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

        // user stats screen
        .state('userStats', {
            url: "/userStats",
            templateUrl: "templates/userStats.html",
            controller: "userStatsCtrl",
            onEnter: function($state, manageState){
                var correctState = manageState.manageLoggedState("userStats");
                if (correctState != "userStats") {
                    $state.go(correctState);
                }
            }
        })

        // favsList screen
        .state('favs', {
            url: "/favs",
            templateUrl: "templates/favsList.html",
            controller: "favsListCtrl",
            onEnter: function($state, manageState){
                var correctState = manageState.manageLoggedState("favs");
                if (correctState != "favs") {
                    $state.go(correctState);
                }
            }
        })

        // followList screen
        .state('follows', {
            url: "/follows",
            templateUrl: "templates/followList.html",
            controller: "followListCtrl",
            onEnter: function($state, manageState){
                var correctState = manageState.manageLoggedState("follows");
                if (correctState != "follows") {
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

        // login screen
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

        // login screen
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

        // sign up screen
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
        })

        // admin management screen
        .state('adminManagement', {
            url: "/adminManagement",
            templateUrl: "templates/adminManagement.html",
            controller: "adminManagementCtrl",
            onEnter: function($state, manageState){
                var correctState = manageState.manageAdminState("adminManagement");
                if (correctState != "adminManagement") {
                    $state.go(correctState);
                }
            }
        })

        // admin stats screen
        .state('adminStats', {
            url: "/adminStats",
            templateUrl: "templates/adminStats.html",
            controller: "adminStatsCtrl",
            onEnter: function($state, manageState){
                var correctState = manageState.manageAdminState("adminStats");
                if (correctState != "adminStats") {
                    $state.go(correctState);
                }
            }
        });

        $urlRouterProvider.otherwise('login');
    })

    .config(['$httpProvider',function ($httpProvider) {
        /**
         *  HTTP Interceptor.
         *  Authorization JWT is sent in every request if exist.
         *  LogOut function is execute in every response if http 401.
         */
        $httpProvider.interceptors.push(['$q','$injector', function ($q, $injector) {
            return {
                'request': function (config) {
                    var authService = $injector.get('auth');
                    config.headers = config.headers || {};
                    if (authService.getToken()) {
                        config.headers.Authorization = 'Bearer ' + authService.getToken();
                    }
                    return config;
                },
                'responseError': function (response) {

                    if (response.status === 401) {
                        var authService = $injector.get('auth');
                        //Si el token está caducado -> Vamos a login
                        if(authService.getToken() && authService.isTokenExpired()){
                            console.log("Expired token! Redirecting to login...");
                            authService.logout();
                        }
                    }
                    return $q.reject(response);
                }
            };
        }]);
    }]);
