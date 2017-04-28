'use strict';

var server = require('../../server.js');
var User = server.models.User;

var LoginPageObject = require('./pageObjects/login.js');
var ProfilePageOject = require('./pageObjects/profile');
var NavbarPageOject = require('./pageObjects/components/navbar.js');

// login-spec.js
describe('Profile Page', function() {
    var loginPage,
        profilePage,
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
        profilePage = new ProfilePageOject();
        navbar = new NavbarPageOject();
    });

    it('should show an error with incorrect credentials', function() {
        loginPage.get();

        loginPage.setEmail('e2etest@email.com');
        loginPage.setPassword('pass');
        loginPage.loginClick();

        navbar.goProfile();

        profilePage.setCurrentPassword("wrongPass");
        profilePage.setNewPassword("newPass");
        profilePage.changePasswordClick();

        expect(profilePage.getError()).toContain("Email o contraseña actual incorrectos");
        navbar.goLogout();
    });

    it('should change the current password', function() {
        loginPage.get();

        loginPage.setEmail('e2etest@email.com');
        loginPage.setPassword('pass');
        loginPage.loginClick();

        navbar.goProfile();

        profilePage.setCurrentPassword("pass");
        profilePage.setNewPassword("newPass");
        profilePage.changePasswordClick();

        expect(profilePage.getSuccess()).toContain("Usuario actualizado correctamente");

        navbar.goLogout();

        loginPage.setEmail('e2etest@email.com');
        loginPage.setPassword('pass');
        loginPage.loginClick();

        expect(loginPage.getError()).toContain("Email o contraseña incorrectos");
    });

    it('should delete the account', function() {
        loginPage.get();

        loginPage.setEmail('e2etest@email.com');
        loginPage.setPassword('newPass');
        loginPage.loginClick();

        navbar.goProfile();

        profilePage.setCurrentPassword("newPass");
        profilePage.deleteAccountClick();

        expect(browser.getCurrentUrl()).toBe(loginPage.getUrl());

        loginPage.setEmail('e2etest@email.com');
        loginPage.setPassword('newPass');
        loginPage.loginClick();

        expect(loginPage.getError()).toContain("La cuenta no está activa. Contacte con el administrador.");
    });

    /*
     * Removes the user created at the begining of the tests
     * after every test is finished.
     */
    afterAll(function(){
        User.collection.remove({"email":'e2etest@email.com'});
    });
});
