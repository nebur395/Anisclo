'use strict';

var LoginPageObject = require('./pageObjects/login.js');
var ProfilePageOject = require('./pageObjects/profile');
var NavbarPageOject = require('./pageObjects/components/navbar.js');

// login-spec.js
describe('Profile Page', function() {
    var loginPage,
        profilePage,
        navbar;

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

        expect(loginPage.getError()).toContain("Email o contraseña incorrectos");
    });
});
