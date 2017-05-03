'use strict';

var server = require('../../server.js');
var User = server.models.User;
var POI = server.models.POI;

var LoginPageObject = require('./pageObjects/login');
var AdminPageObject = require('./pageObjects/admin');
var NavbarPageOject = require('./pageObjects/components/navbar');

// starter-spec.js
describe('Admin Page', function() {
    var loginPage,
        navbar,
        adminPage;

    beforeAll(function(){
        var hashPass = require('crypto')
            .createHash('sha1')
            .update("pass")
            .digest('base64');

        User.create({

            email: "e2etestADMIN@email.com",
            name: "e2etestADMIN",
            lastname: "teste2eADMIN",
            password: hashPass,
            firstLogin: false,
            admin: true
        });

        User.create({

            email: "e2etest@email.com",
            name: "e2etest",
            lastname: "teste2e",
            password: hashPass,
            firstLogin: false,
            admin: false,
            isActive: false
        });
    });

    beforeEach(function() {
        loginPage = new LoginPageObject();
        navbar = new NavbarPageOject();
        adminPage = new AdminPageObject();
    });

    it('should active a user', function() {
        loginPage.get();

        loginPage.setEmail('e2etestADMIN@email.com');
        loginPage.setPassword('pass');
        loginPage.loginClick();

        navbar.goUserManagement();
        expect(browser.getCurrentUrl()).toBe(adminPage.getUrl());

        adminPage.userClick('e2etest@email.com');
        browser.sleep(500);
        adminPage.activeClick('e2etest@email.com');

        expect(adminPage.getMessage()).toContain("Cuenta de usuario reactivada correctamente");

    });

    /*
     * Removes the user created at the begining of the tests
     * after every test is finished.
     */
    afterAll(function(){
        User.collection.remove({"email":'e2etest@email.com'});
        User.collection.remove({"email":'e2etestADMIN@email.com'});
    });

});
