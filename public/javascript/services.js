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
                    callbackSuccess(data.message);
                }).error(function (data) {
                    callbackError(data.message);
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
                    callbackError(data.message);
                });
            },

            // make fav a poi
            favPoi: function (id, callbackSuccess, callbackError) {
                var tmp = {poiId: id};
                $http({
                    method: 'PUT',
                    url: 'users/' + auth.getEmail() + '/fav',
                    data: JSON.stringify(tmp),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    var tmp = angular.fromJson(localStorage.userIdentity);
                    var index = tmp.favs.indexOf(id);
                    if (index == -1) {
                        tmp.favs.push(id);
                    } else {
                        tmp.favs.splice(index, 1);
                    }
                    auth.authenticate(tmp);
                    callbackSuccess(data.message);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // follow/unfollow a user
            followUser: function (email, callbackSuccess, callbackError) {
                var tmp = {userToFollowEmail: email};
                $http({
                    method: 'PUT',
                    url: 'users/' + auth.getEmail() + '/follow',
                    data: JSON.stringify(tmp),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    var tmp = angular.fromJson(localStorage.userIdentity);
                    var index = tmp.follows.indexOf(email);
                    if (index == -1) {
                        tmp.follows.push(email);
                    } else {
                        tmp.follows.splice(index, 1);
                    }
                    auth.authenticate(tmp);
                    callbackSuccess(data.message);
                }).error(function (data) {
                    callbackError(data.message);
                });
            }

        };
    })

    // 'url' service manage the url settings function of the page with the server
    .factory('urlService', function ($http) {
        return {
            // short an url
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
            getListOfPOIs: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'pois/',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.pois);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // search and filter the list of pois
            search: function (tags, callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'pois/filter/',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'tags': tags
                    }
                }).success(function (data) {
                    callbackSuccess(data.pois);
                }).error(function (data) {
                    callbackError(data.message);
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
                    callbackSuccess(data.poi, 'POI añadido correctamente.');
                }).error(function (data) {
                    callbackError(data.message);
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
                    callbackSuccess(poiTemp.poi, data.message);
                }).error(function (data) {
                    callbackError(data.message);
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
                    callbackSuccess(data.poi, 'POI duplicado correctamente.');
                }).error(function (data) {
                    callbackError(data.message);
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
                    callbackSuccess(poi, data.message);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // rate a current poi
            ratePoi: function (poi, rate, callbackSuccess, callbackError) {
                var temp = {
                    id: poi._id,
                    rating: rate
                };
                $http({
                    method: 'PUT',
                    url: 'pois/' + poi._id + '/rate',
                    data: JSON.stringify(temp),
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

    // 'routes' service manage the routes settings function of the page with the server
    .factory('routesService', function ($http) {
        return {
            // save a route in the server
            saveRoute: function (route, callbackSuccess, callbackError) {
                var idRoutes = [];
                for (i=0;i<route.routePOIs.length;i++) {
                    idRoutes.push(route.routePOIs[i]._id);
                }
                route.routePOIs = idRoutes;
                var routeInfoTemp = {
                    distance: {text: "", value: 0}, duration: {text: "", value: 0}
                };
                var metaDataRoute = [];
                for (i=0;i<route.routeInfo.length;i++) {
                    routeInfoTemp.distance.text = route.routeInfo[i].distance.text;
                    routeInfoTemp.distance.value = route.routeInfo[i].distance.value;
                    routeInfoTemp.duration.text = route.routeInfo[i].duration.text;
                    routeInfoTemp.duration.value = route.routeInfo[i].duration.value;
                    metaDataRoute.push(routeInfoTemp);
                }
                route.routeInfo = metaDataRoute;
                $http({
                    method: 'POST',
                    url: 'routes/',
                    data: JSON.stringify(route),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.routeID);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // Send a route by email
            sendRouteByEmail: function (routeId, emails, callbackSuccess, callbackError) {
                $http({
                    method: 'POST',
                    url: 'routes/' + routeId + '/sendRoute/',
                    data: JSON.stringify(emails),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.message);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // Get the info of an [routeId] route
            findRoute: function (routeId, callbackSuccess, callbackError) {
                $http({
                    method: 'POST',
                    url: 'routes/' + routeId + '/',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data);
                }).error(function (data) {
                    callbackError(data.message);
                });
            }
        };
    });



