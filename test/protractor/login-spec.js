'use strict';

var LoginPageObject = require('./pageObjects/login.js');
var StarterPageOject = require('./pageObjects/starter');
var NavbarPageOject = require('./pageObjects/components/navbar.js');

// login-spec.js
describe('Login Page', function() {
    var loginPage,
        starterPage,
        navbar;

    beforeEach(function() {
       loginPage = new LoginPageObject();
       starterPage = new StarterPageOject();
       navbar = new NavbarPageOject();
    });

    it('should show an error with incorrect credentials', function() {
        loginPage.get();

        loginPage.setEmail('nebur395@hotmail.com');
        loginPage.setPassword('pass23');
        loginPage.loginClick();

        expect(loginPage.getError()).toContain("Email o contraseña incorrectos");
    });

    it('should login', function() {
        loginPage.get();

        loginPage.setEmail('nebur395@hotmail.com');
        loginPage.setPassword('pass');
        loginPage.loginClick();

        expect(browser.getCurrentUrl()).toBe(starterPage.getUrl());
    });

    it('should logout', function() {
        loginPage.get();

        navbar.goLogout();

        expect(browser.getCurrentUrl()).toBe(loginPage.getUrl());
    });
});
