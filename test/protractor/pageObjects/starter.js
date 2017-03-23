'use strict';

var StarterPageOject = function() {
    var profileNavbar = element(by.linkText('Cuenta'));
    var logoutNavbar = element(by.linkText('Salir'));

    this.getUrl = function() {
        return "http://localhost:8080/#/starter";
    };

    this.goProfile = function() {
        profileNavbar.click();
    };
    this.goLogout = function() {
        logoutNavbar.click();
    };
};

module.exports = StarterPageOject;
