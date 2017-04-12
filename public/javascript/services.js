angular.module('pirineoPOIApp')

    // 'auth' service manage the authentication function of the page with the server
    .factory('auth', function ($state, $http, $base64) {

        var _identity = undefined,
            _authenticated = false;

        return {
            //return true if the user is authenticated
            isAuthenticated: function () {
                if (_authenticated) {
                    return _authenticated;
                } else {
                    var tmp = angular.fromJson(localStorage.userIdentity);
                    if (tmp !== undefined) {
                        this.authenticate(tmp);
                        return _authenticated;
                    } else {
                        return false;
                    }
                }
            },

            //authenticate the [identity] user
            authenticate: function (identity) {
                _identity = identity;
                _authenticated = identity !== undefined;
                localStorage.userIdentity = angular.toJson(_identity);
            },

            //logout function
            logout: function () {
                _identity = undefined;
                _authenticated = false;
                localStorage.removeItem('userIdentity');
                $state.go('login');
            },

            getUserObject: function () {
                return _identity;
            },

            getUsername: function () {
                return _identity.name;
            },

            getEmail: function () {
                return _identity.email;
            },

            getLastname: function () {
                return _identity.lastname;
            },

            getAdmin: function () {
                return _identity.admin;
            },

            getFirstLogin: function () {
                return _identity.firstLogin;
            },

            getFavs: function () {
                return _identity.favs;
            },

            getFollows: function () {
                return _identity.follows;
            },

            //send the login info to the server
            login: function (user, password, callback) {
                var that = this;
                $http({
                    method: 'GET',
                    url: 'users/login',
                    headers: {
                        'Authorization': 'Basic ' +
                        $base64.encode(user + ":" + password)
                    }
                }).success(function (data) {
                    that.authenticate(data);
                    if (data.firstLogin) {
                        $state.go('changePassword');
                    } else if (data.admin) {
                        $state.go('admin');
                    } else {
                        $state.go('starter');
                    }
                }).error(function (data) {
                    callback(data.message);
                });
            },

            //send the register info to the server
            signUp: function (userObject, callbackSuccess, callbackError) {
                $http({
                    method: 'POST',
                    url: 'users/',
                    data: JSON.stringify(userObject),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.message);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // Change password user service
            changePassword: function (userObject, email, callbackError) {
                var that = this;
                $http({
                    method: 'PUT',
                    url: 'users/' + email,
                    data: JSON.stringify(userObject),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    var tmp = angular.fromJson(localStorage.userIdentity);
                    tmp.firstLogin = false;
                    that.authenticate(tmp);
                    $state.go('starter');
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // Retrieve password user service
            retrievePassword: function (email, callbackSuccess, callbackError) {
                $http({
                    method: 'PUT',
                    url: 'users/retrievePass',
                    data: JSON.stringify(email),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.message);
                }).error(function (data) {
                    callbackError(data.message);
                });
            }
        };
    })

    // 'manageState' service manage the control access to the different states of the page
    .factory('manageState', function (auth) {
        return {
            // manage access privileges of any logged state
            manageLoggedState: function (state) {
                if (!auth.isAuthenticated()){
                    return "login";
                } else if(auth.getAdmin()) {
                    return "admin";
                } else if(auth.getFirstLogin()) {
                    return "changePassword";
                } else {
                    if (state == "changePassword") {
                        return "starter";
                    } else {
                        return state;
                    }
                }
            },
            // manage access privileges of any not logged state
            manageNotLoggedState: function (state) {
                if (!auth.isAuthenticated()) {
                    return state;
                } else if(auth.getAdmin()) {
                    return "admin";
                } else if(auth.getFirstLogin()) {
                    return "changePassword";
                } else {
                    return "starter";
                }
            }
        };
    })

    // 'settings' service manage the profile settings function of the page with the server
    .factory('settings', function ($http, auth) {
        return {
            // change the current user password
            changePassword: function (email, passwords, callbackSuccess, callbackError) {
                $http({
                    method: 'PUT',
                    url: 'users/' + email,
                    data: JSON.stringify(passwords),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            // change the current user password
            deleteAccount: function (email, password, callbackError) {
                var temp = {current: password};
                $http({
                    method: 'DELETE',
                    url: 'users/' + email,
                    data: JSON.stringify(temp),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    auth.logout();
                }).error(function (data) {
                    callbackError(data);
                });
            }

        };
    })

    // 'url' service manage the url settings function of the page with the server
    .factory('urlService', function ($http) {
        return {
            // change the current user password
            shortUrl: function (url, callbackSuccess, callbackError) {
                var tmp = {url: url};
                $http({
                    method: 'POST',
                    url: 'url/',
                    data: JSON.stringify(tmp),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.urlShort);
                }).error(function (data) {
                    callbackError(data);
                });
            }
        };
    })

    // 'poiService' service manage the poi settings function of the page with the server
    .factory('poiService', function ($state, $http, auth) {
        return {
            // get the current list of pois
            getListOfPOIs: function (callback) {
                $http({
                    method: 'GET',
                    url: 'pois/',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callback(data.pois);
                }).error(function (data) {
                    alert(data);
                });
            },

            // search and filter the list of pois
            search: function (tags, callback) {
                $http({
                    method: 'GET',
                    url: 'pois/filter',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'tags': JSON.stringify(tags)
                    }
                }).success(function (data) {
                    callback(data.pois);
                }).error(function (data) {
                    alert(data);
                });
            },

            // add a new poi
            addPoi: function (poi, callbackSuccess, callbackError) {
                var poiTemp = {
                    userEmail: auth.getEmail(),
                    poi: poi
                };
                $http({
                    method: 'POST',
                    url: 'pois/',
                    data: JSON.stringify(poiTemp),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(poiTemp.poi);//TODO cambiar por data
                    alert(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            // modify an existing poi
            modifyPoi: function (poi, callbackSuccess, callbackError) {
                var poiTemp = {
                    userEmail: auth.getEmail(),
                    poi: poi
                };
                $http({
                    method: 'PUT',
                    url: 'pois/' + poiTemp.poi._id,
                    data: JSON.stringify(poiTemp),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(poiTemp.poi);//TODO cambiar por data
                    alert(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            // duplicate a current poi
            duplicatePoi: function (poi, callbackSuccess, callbackError) {
                var temp = {
                    userEmail: auth.getEmail()
                };
                $http({
                    method: 'POST',
                    url: 'pois/' + poi._id,
                    data: JSON.stringify(temp),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess();
                    alert(data);
                }).error(function (data) {
                    callbackError(data);
                });
            },

            // delete a current poi
            deletePoi: function (poi, callbackSuccess, callbackError) {
                var temp = {
                    userEmail: auth.getEmail()
                };
                $http({
                    method: 'DELETE',
                    url: 'pois/' + poi._id,
                    data: JSON.stringify(temp),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(poi);
                    alert(data);
                }).error(function (data) {
                    callbackError(data);
                });
            }
        };
    });



