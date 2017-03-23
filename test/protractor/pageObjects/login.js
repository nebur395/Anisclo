'use strict';

var LoginPageObject = function() {
    var emailInput = element(by.model('email'));
    var passwordInput = element(by.model('password'));
    var loginButton = element(by.buttonText('Iniciar sesión'));
    var errorMsg = element(by.binding('errorMsg'));

    this.get = function() {
        browser.get('http://localhost:8080/#/login');
    };

    this.getUrl = function() {
        return "http://localhost:8080/#/login";
    };

    this.setEmail = function(email) {
        emailInput.sendKeys(email)
    };

    this.setPassword = function(password) {
        passwordInput.sendKeys(password)
    };

    this.loginClick = function() {
        loginButton.click()
    };

    this.getError = function() {
        return errorMsg.getText();
    };
};

module.exports = LoginPageObject;
