'use strict';

var NavbarPageOject = function() {
    var profile = element(by.linkText('Cuenta'));
    var logout = element(by.linkText('Salir'));
    var home = element(by.linkText("Pirineo's POI"));
    var login = element(by.linkText('Iniciar Sesión'));
    var signUp = element(by.linkText('Registrarse'));
    var userManagement = element(by.linkText('Gestión de usuarios'));

    this.goProfile = function() {
        profile.click();
    };
    this.goLogout = function() {
        logout.click();
    };
    this.goHome = function() {
        home.click();
    };
    this.goLogin = function() {
        login.click();
    };
    this.goSignUp = function() {
        signUp.click();
    };
    this.goUserManagement = function() {
        userManagement.click();
    };
};

module.exports = NavbarPageOject;
