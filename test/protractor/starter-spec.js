'use strict';

var server = require('../../server.js');
var User = server.models.User;
var POI = server.models.POI;

var LoginPageObject = require('./pageObjects/login');
var StarterPageOject = require('./pageObjects/starter');

// starter-spec.js
describe('Starter Page', function() {
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
    });

    it('should save a POI', function() {
        loginPage.get();

        loginPage.setEmail('e2etest@email.com');
        loginPage.setPassword('pass');
        loginPage.loginClick();

        expect(browser.getCurrentUrl()).toBe(starterPage.getUrl());
        browser.sleep(500);
        starterPage.mapClick();


        browser.sleep(500);
        starterPage.setPoiName("poiTest");
        starterPage.setPoiTags("#poiTest");
        starterPage.setPoiDescription("poiTestDescription");
        starterPage.setPoiUrl("poiTestUrl");
        starterPage.savePOIClick();

        expect(starterPage.getMessage()).toContain("POI añadido correctamente");//POI eliminado correctamente

    });

    /*
     * Removes the user created at the begining of the tests
     * after every test is finished.
     */
    afterAll(function(){
        User.collection.remove({"email":'e2etest@email.com'});
        POI.collection.remove({"name":"poiTest"});
    });

});
