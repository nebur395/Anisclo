'use strict';

var server = require('../../server.js');
var User = server.models.User;

var LoginPageObject = require('./pageObjects/login.js');
var StarterPageOject = require('./pageObjects/starter');
var NavbarPageOject = require('./pageObjects/components/navbar.js');

// login-spec.js
describe('Login Page', function() {
    var loginPage,
        starterPage,
        navbar;

    beforeAll(function(){
        var hashPass = require('crypto')
            .createHash('sha1')
            .update("pass")
            .digest('base64');

        User.create({

            email: "e2etest@email.com",
            name: "e2etest",
            lastname: "teste2e",
            password: hashPass,
            firstLogin: false,
            admin: false

        });
    });

    beforeEach(function() {
       loginPage = new LoginPageObject();
       starterPage = new StarterPageOject();
       navbar = new NavbarPageOject();
    });

    it('should show an error with incorrect credentials', function() {
        loginPage.get();

        loginPage.setEmail('e2etest@email.com');
        loginPage.setPassword('pass23');
        loginPage.loginClick();

        expect(loginPage.getError()).toContain("Email o contraseña incorrectos");
    });

    it('should login', function() {
        loginPage.get();

        loginPage.setEmail('e2etest@email.com');
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
