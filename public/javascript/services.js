angular.module('pirineoPOIApp')

    // 'auth' service manage the authentication function of the page with the server
    .factory('auth', function ($state, $http, $base64, jwtHelper) {

        var _identity = undefined,
            _authenticated = false;

        return {
            //return true if the user is authenticated
            isAuthenticated: function () {
                if (_authenticated) {
                    return _authenticated;
                } else {
                    var tmp = angular.fromJson(localStorage.userIdentity);
                    if (typeof tmp !== 'undefined' && tmp !== null) {
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
                _authenticated = (typeof identity !== 'undefined' && identity !== null);
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
                if (typeof _identity !== 'undefined' && _identity !== null) {
                    return _identity._identity;
                } else {
                    return "";
                }
            },

            getUsername: function () {
                if (typeof _identity !== 'undefined' && _identity !== null) {
                    return _identity.name;
                } else {
                    return "";
                }
            },

            getEmail: function () {
                if (typeof _identity !== 'undefined' && _identity !== null) {
                    return _identity.email;
                } else {
                    return "";
                }
            },

            getLastname: function () {
                if (typeof _identity !== 'undefined' && _identity !== null) {
                    return _identity.lastname;
                } else {
                    return "";
                }
            },

            getAdmin: function () {
                if (typeof _identity !== 'undefined' && _identity !== null) {
                    return _identity.admin;
                } else {
                    return "";
                }
            },

            getFirstLogin: function () {
                if (typeof _identity !== 'undefined' && _identity !== null) {
                    return _identity.firstLogin;
                } else {
                    return "";
                }
            },

            getFavs: function () {
                if (typeof _identity !== 'undefined' && _identity !== null) {
                    return _identity.favs;
                } else {
                    return "";
                }
            },

            getFollows: function () {
                if (typeof _identity !== 'undefined' && _identity !== null) {
                    return _identity.follows;
                } else {
                    return "";
                }
            },

            getGoogle: function () {
                if (typeof _identity !== 'undefined' && _identity !== null) {
                    return _identity.google;
                } else {
                    return "";
                }
            },

            getToken: function () {
                if (typeof _identity !== 'undefined' && _identity !== null) {
                    return _identity.token;
                } else {
                    return "";
                }
            },

            isTokenExpired: function () {
                if (typeof _identity !== 'undefined' && _identity !== null) {
                    return jwtHelper.isTokenExpired(_identity.token);
                } else {
                    return true;
                }
            },

            //send the login info to the server
            login: function (user, password, google,callback) {
                var that = this;
                if(google){
                    $http({
                        method: 'GET',
                        url: 'users/'+user,
                        headers: {
                            'Content-Type': 'application/json; charset=UTF-8',
                            'token': password
                        }
                    }).success(function (data) {
                        var user = jwtHelper.decodeToken(data.token);
                        user.token = data.token;
                        that.authenticate(user);
                        if (data) {
                            $state.go('starter');
                        }
                    }).error(function (data) {
                        callback(data.message);
                    });
                }
                else{
                    $http({
                        method: 'GET',
                        url: 'users/login',
                        headers: {
                            'Authorization': 'Basic ' +
                            $base64.encode(user + ":" + password)
                        }
                    }).success(function (data) {
                        var user = jwtHelper.decodeToken(data.token);
                        user.token = data.token;
                        that.authenticate(user);
                        if (data.firstLogin) {
                            $state.go('changePassword');
                        } else {
                            $state.go('starter');
                        }
                    }).error(function (data) {
                        callback(data.message);
                    });
                }
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
            // manage access privileges of any logged state for a normal user
            manageLoggedState: function (state) {
                if (!auth.isAuthenticated()){
                    return "login";
                } else if(auth.getAdmin()) {
                    if (state == "profile") {
                        return state;
                    } else {
                        return "starter";
                    }
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

            // manage access privileges of any logged state for an admin user
            manageAdminState: function (state) {
                if (!auth.isAuthenticated()){
                    return "login";
                } else if(auth.getAdmin()) {
                    return state;
                } else if(auth.getFirstLogin()) {
                    return "changePassword";
                } else {
                    return "starter";
                }
            },

            // manage access privileges of any not logged state
            manageNotLoggedState: function (state) {
                if (!auth.isAuthenticated()) {
                    return state;
                } else if(auth.getAdmin()) {
                    return "starter";
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

            // delete user account
            deleteAccount: function (email, password, google, callbackError) {
                var temp = {
                    current: password,
                    google:google
                };
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
            },

            // get a single poi
            getPoi: function(id, callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'pois/' + id,
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.poi);
                }).error(function (data) {
                    var tmp = angular.fromJson(localStorage.userIdentity);
                    var index = tmp.favs.indexOf(id);
                    if (index != -1) {
                        tmp.favs.splice(index, 1);
                    }
                    auth.authenticate(tmp);
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
                var metaDataRoute = [];
                for (i=0;i<route.routeInfo.length;i++) {
                    var routeInfoTemp = {
                        distance: {text: "", value: 0}, duration: {text: "", value: 0}
                    };
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
                    method: 'GET',
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
    })

    // 'userStats' service manage the userStats settings functions of the page with the server
    .factory('userStats', function ($http, auth) {
        return {
            // Get the most rated owned POI
            getMostRated: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'stats/' + auth.getEmail() + '/mostRated',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.pois);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // Get the most favorite owned POI
            getMostFavorite: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'stats/' + auth.getEmail() + '/mostFavorite',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.pois);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // Get the evolution of POIs creation date
            getPoiByDate: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'stats/' + auth.getEmail() + '/poiByDate',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.pois);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // Get the most POI-populated location
            getPoiByLocation: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'stats/' + auth.getEmail() + '/poiByLocation',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.pois);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // Get the most duplicated owned POI
            getDuplicatedPois: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'stats/' + auth.getEmail() + '/duplicatedPois',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.pois);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // Get the number of followers
            getFollowers: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'stats/' + auth.getEmail() + '/followers',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.followers);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // Get the longest routes by distance
            getLongestRoutesByDistance: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'stats/' + auth.getEmail() + '/longestRoutesByDistance',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.routes);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // Get the longest routes by time
            getLongestRoutes: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'stats/' + auth.getEmail() + '/longestRoutes',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.routes);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // Get the number of routes with the same amount of POIs
            getPoisInRoutes: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'stats/' + auth.getEmail() + '/poisInRoutes',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.routes);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // Get the most frequent transportation
            getTransportUsage: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'stats/' + auth.getEmail() + '/transportsUsage',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.routes);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // Get the most recreated routes
            getMostRequestedRoutesById: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'stats/' + auth.getEmail() + '/mostRequestedRoutesById',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.routes);
                }).error(function (data) {
                    callbackError(data.message);
                });
            }
        };
    })

    // 'userManagement' service manage the user management function of the page with the server
    .factory('userManagement', function ($http) {
        return {
            // save a route in the server
            getUsers: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'admin/users/',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.users);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // modify a current user with admin privileges
            setUser: function (user, email, callbackSuccess, callbackError) {
                $http({
                    method: 'PUT',
                    url: 'admin/users/' + email,
                    data: JSON.stringify(user),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.message);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // ban a current user with admin privileges
            banUser: function (time, email, callbackSuccess, callbackError) {
                $http({
                    method: 'PUT',
                    url: 'admin/users/' + email + '/ban',
                    data: JSON.stringify(time),
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.message);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // unBan a current user with admin privileges
            unBanUser: function (email, callbackSuccess, callbackError) {
                $http({
                    method: 'PUT',
                    url: 'admin/users/' + email + '/unban',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function (data) {
                    callbackSuccess(data.message);
                }).error(function (data) {
                    callbackError(data.message);
                });
            },

            // admin's dragon balls are used to active a current user
            useDragonBalls: function (email, callbackSuccess, callbackError) {
                $http({
                    method: 'PUT',
                    url: 'admin/users/' + email + '/useDragonBalls',
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

    // 'adminStats' service manages the adminStats settings functions of the page with the server
    .factory('adminStats', function ($http) {
        return{
            // returns the number of users in the system, including bans
            getTotalUsers: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'adminStats/totalUsers',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function(data) {
                    callbackSuccess(data.totalUsers);
                }).error(function(data){
                    callbackError(data.message);
                })
            },
            // return the number of pois in the system
            getTotalPois: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'adminStats/totalPois',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function(data){
                    callbackSuccess(data.totalPois);
                }).error(function(data){
                    callbackError(data.message);
                })
            },
            // return the number of routes in the system
            getTotalRoutes: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'adminStats/totalRoutes',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function(data){
                    callbackSuccess(data.totalRoutes);
                }).error(function(data){
                    callbackError(data.message);
                })
            },
            // returns an array of number of users by account state (active, inactive, temporally banned, permanently banned)
            getUsersStatus: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'adminStats/usersStatus',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function(data){
                    callbackSuccess(data.usersStatus);
                }).error(function(data){
                    callbackError(data.message);
                })
            },
            // returns the average number of pois per user
            getPoisPerUser: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'adminStats/poisPerUser',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function(data){
                    callbackSuccess(data.poisPerUser);
                }).error(function(data){
                    callbackError(data.message);
                })
            },
            // returns the average number of routes per user
            getRoutesPerUser: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'adminStats/routesPerUser',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function(data){
                    callbackSuccess(data.routesPerUser);
                }).error(function(data){
                    callbackError(data.message);
                })
            },
            // returns an array with the number of the last login of every user, grouped by month
            getLastLogins: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'adminStats/lastLogins',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function(data){
                    callbackSuccess(data.lastLogins);
                }).error(function(data){
                    callbackError(data.message);
                })
            },
            // returns two arrays: the number of new signUps and the number of accounts removed,
            // both grouped by months
            getSignUpAndRemove: function (callbackSuccess, callbackError) {
                $http({
                    method: 'GET',
                    url: 'adminStats/signUpAndRemove',
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8'
                    }
                }).success(function(data){
                    callbackSuccess(data.signUps,data.removes);
                }).error(function(data){
                    callbackError(data.message);
                })
            }
        }
    });


