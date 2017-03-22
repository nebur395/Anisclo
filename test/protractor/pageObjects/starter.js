'use strict';

var StarterPageOject = function() {
    var profileNavbar = element(by.linkText('Cuenta'));
    var logoutNavbar = element(by.linkText('Salir'));

    this.goProfile = function() {
        profileNavbar.click();
    };
    this.goLogout = function() {
        logoutNavbar.click();
    };
};

module.exports = StarterPageOject;
