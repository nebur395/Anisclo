'use strict';

var LoginPageObject = require('./pageObjects/login.js');

// spec.js
describe('Login Page', function() {
    var loginPage;

    beforeEach(function() {
       loginPage = new LoginPageObject();
    });

    it('should show an error with incorrect credentials', function() {
        loginPage.get();

        loginPage.setEmail('nebur395@hotmail.com');
        loginPage.setPassword('pass23');
        loginPage.loginClick();

        expect(browser.getTitle()).toEqual("Pirineo's POI");
        expect(loginPage.getError()).toContain("Email o contraseña incorrectos");
    });

    it('should login', function() {
        loginPage.get();

        loginPage.setEmail('nebur395@hotmail.com');
        loginPage.setPassword('pass');
        loginPage.loginClick();

        expect(browser.getCurrentUrl()).toBe('http://localhost:8080/#/starter');
    });
});
