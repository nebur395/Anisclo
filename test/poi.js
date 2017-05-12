var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var server = require('../server.js');
var User = server.models.User;
var POI = server.models.POI;
var ObjectId = require('mongoose').Types.ObjectId;
var wc = require('which-country');
var lookup = require('country-code-lookup');
var createUserToken = require('./jwtCreator').createUserToken;

chai.use(chaiHttp);

/**
 * Test suite for POI functionalities.
 */
describe('POI', function(){

    var name = "Testing";
    var lastname = "Test";
    var email = "testPOI@email.com";
    var password = "testPass";
    var hashPass = require('crypto')
        .createHash('sha1')
        .update(password)
        .digest('base64');

    var email2 = "email@test.com";

    var lat = 41.64469659784919;
    var lng = -0.8703231811523438;
    var continent = lookup.byIso(wc([lng, lat])).continent;

    var poiRequest = {
        "userEmail": email,
        "poi": {
            "name": "TestPOI",
            "description": "A test POI",
            "tags": "#test#POITEST",
            "lat": lat,
            "lng": lng,
            "location": continent
        }
    };

    var poi = {

        "name": "TestPOI",
        "description": "A test POI",
        "tags": ['test', 'poitest'],
        "lat": lat,
        "lng": lng,
        "owner": email,
        "location": continent
    };

    var url = "https://noterayesco.herokuapp.com/";
    var image = "iVBORw0KGgoAAAANSUhEUgAAATQAAAEuCAIAAACPrn" +
        "k1AAAAKnRFWHRDcmVhdGlvbiBUaW1lAOh0IDIwIFhJIDIwMDgg" +
        "MDE6MzE6NDUgKzAxMDAbKxfdAAAAB3RJTUUH2AsUACAcG5e91g" +
        "AAAAlwSFlzAAAK8AAACvABQqw0mAAAAARnQU1BAACxjwv8YQUA" +
        "AAO6SURBVHja7doxDsIwEABBgvj/l00NJKmQshfNdHZ1zeoKe1" +
        "trPYCe59UDAPvECVHihChxQpQ4IUqcECVOiBInRIkTosQJUeKE" +
        "KHFClDghSpwQJU6IEidEiROixAlR4oQocUKUOCFKnBAlTogSJ0" +
        "SJE6LECVHihChxQpQ4IUqcECVOiBInRIkTosQJUeKEKHFClDgh" +
        "SpwQJU6IEidEiROixAlR4oQocUKUOCFKnBAlTogSJ0SJE6LECV" +
        "HihChxQpQ4IUqcECVOiBInRIkTosQJUeKEKHFClDghSpwQJU6I" +
        "EidEiROixAlR4oQocUKUOCFKnBAlTogSJ0SJE6LECVHihChxQp" +
        "Q4IUqcECVOiBInRIkTosQJUeKEKHFClDghSpwQJU6IEidEiROi" +
        "xAlR4oQocUKUOCFKnBAlTogSJ0SJE6LECVHihChxQpQ4IUqcEC" +
        "VOiBInRIkTosQJUeKEKHFClDghSpwQJU6IEidEiROixAlR4oQo" +
        "cUKUOCFKnBAlTogSJ0SJE6LECVHihChxQpQ4IUqcECVOiBInRI" +
        "kTosQJUeKEKHFClDghSpwQJU6IEidEiROixAlR4oQocULU6+oB" +
        "+Idt+ziudfVA/IHNOd9Xmbs3DCTO4Y461Od84pzsvEB9DidOiB" +
        "InRIkTosQJUeKc7Pw902vncOIc7qhAZc4nzvl+O1TmLfi+dwtq" +
        "vCObE6LECVHihChxQpQ4IUqcECVOiBInRIkTosQJUeKEKHFClD" +
        "ghSpwQJU6IEidEiROixAlR4oQocUKUOCFKnBAlTogSJ0SJE6LE" +
        "CVHihChxQpQ4IUqcECVOiBInRIkTosQJUeKEKHFClDghSpwQJU" +
        "6IEidEiROixAlR4oQocUKUOCFKnBAlTogSJ0SJE6LECVHihChx" +
        "QpQ4IUqcECVOiBInRIkTosQJUeKEKHFClDghSpwQJU6IEidEiR" +
        "OixAlR4oQocUKUOCFKnBAlTogSJ0SJE6LECVHihChxQpQ4IUqc" +
        "ECVOiBInRIkTosQJUeKEKHFClDghSpwQJU6IEidEiROixAlR4o" +
        "QocUKUOCFKnBAlTogSJ0SJE6LECVHihChxQpQ4IUqcECVOiBIn" +
        "RIkTosQJUeKEKHFClDghSpwQJU6IEidEiROixAlR4oQocUKUOC" +
        "FKnBAlTogSJ0SJE6LECVHihChxQpQ4IUqcECVOiBInRIkTosQJ" +
        "UeKEKHFClDghSpwQJU6IEidEiROixAlR4oQocUKUOCFKnBAlTo" +
        "gSJ0SJE6LECVHihChxQpQ4IeoNZV8VWyt15Y8AAAAASUVORK5CYII=";


    /*
     * It creates a new user before the test suite starts executing.
     */
    before(function(done){

        User.create({

            email: email,
            name: name,
            lastname: lastname,
            password: hashPass,
            firstLogin: true,
            admin: false

        }, function(){
            done();
        });
    });

    /**
     * Tests for createPOI functionality.
     */
    describe('#createPOI()', function(){

        var poisIds = [];

        var wrongBodyErrorMessage = "Usuario o POI incorrectos";
        var wrongPOIErrorMessage = "Uno o más campos del POI son incorrectos";
        var wrongTagsErrorMessage = "Tags incorrectos";
        var notExistingUserErrorMessage = "El usuario no existe";

        it('should create a new POI making a POST request to /pois', function(done){

            chai.request(server)
                .post('/pois')
                .send(poiRequest)
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .set('Json', true)
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('poi');
                    result.body.poi.should.be.a('object');
                    result.body.poi.should.have.property('_id');
                    result.body.poi.should.have.property('name');
                    result.body.poi.name.should.equal(poiRequest.poi.name);
                    result.body.poi.should.have.property('description');
                    result.body.poi.description.should.equal(poiRequest.poi.description);
                    result.body.poi.should.have.property('tags');
                    result.body.poi.tags.should.equal(poiRequest.poi.tags.toLowerCase());
                    result.body.poi.should.have.property('lat');
                    result.body.poi.lat.should.equal(poiRequest.poi.lat);
                    result.body.poi.should.have.property('lng');
                    result.body.poi.lng.should.equal(poiRequest.poi.lng);
                    result.body.poi.should.have.property('owner');
                    result.body.poi.owner.should.equal(email);
                    result.body.poi.should.have.property('url');
                    result.body.poi.url.should.equal('');
                    result.body.poi.should.have.property('image');
                    result.body.poi.url.should.equal('');

                    poisIds.push(new ObjectId(result.body.poi._id));

                    done();

                });
        });

        it('should create a new POI making a POST request to /pois with an URL and an image', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            duplicatedPoi.poi.url = url;
            duplicatedPoi.poi.image = image;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .set('Json', true)
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('poi');
                    result.body.poi.should.be.a('object');
                    result.body.poi.should.have.property('_id');
                    result.body.poi.should.have.property('name');
                    result.body.poi.name.should.equal(poiRequest.poi.name);
                    result.body.poi.should.have.property('description');
                    result.body.poi.description.should.equal(poiRequest.poi.description);
                    result.body.poi.should.have.property('tags');
                    result.body.poi.tags.should.equal(poiRequest.poi.tags.toLowerCase());
                    result.body.poi.should.have.property('lat');
                    result.body.poi.lat.should.equal(poiRequest.poi.lat);
                    result.body.poi.should.have.property('lng');
                    result.body.poi.lng.should.equal(poiRequest.poi.lng);
                    result.body.poi.should.have.property('owner');
                    result.body.poi.owner.should.equal(email);
                    result.body.poi.should.have.property('url');
                    result.body.poi.url.should.equal(duplicatedPoi.poi.url);
                    result.body.poi.should.have.property('image');
                    result.body.poi.image.should.equal(duplicatedPoi.poi.image);

                    poisIds.push(new ObjectId(result.body.poi._id));

                    done();

                });
        });

        it('should return an error message making a POST request to /pois since the user is blank', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            delete duplicatedPoi.userEmail;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .set('Json', true)
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongBodyErrorMessage);

                    done();
                });
        });

        it('should return an error message making a POST request to /pois since the poi is blank', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            delete duplicatedPoi.poi;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .set('Json', true)
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongBodyErrorMessage);

                    done();
                });
        });

        it('should return an error message making a POST request to /pois since the poi\'s name is blank', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            delete duplicatedPoi.poi.name;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .set('Json', true)
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongPOIErrorMessage);

                    done();
                });
        });

        it('should return an error message making a POST request to /pois since the poi\'s description is blank', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            delete duplicatedPoi.poi.description;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .set('Json', true)
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongPOIErrorMessage);

                    done();
                });
        });

        it('should return an error message making a POST request to /pois since the poi\'s tags are blank', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            delete duplicatedPoi.poi.tags;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .set('Json', true)
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongPOIErrorMessage);

                    done();
                });
        });

        it('should return an error message making a POST request to /pois since the poi\'s tags are wrong', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            duplicatedPoi.poi.tags = "test#POITEST";

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .set('Json', true)
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongTagsErrorMessage);

                    done();
                });
        });

        it('should return an error message making a POST request to /pois since the poi\'s lat is blank', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            delete duplicatedPoi.poi.lat;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .set('Json', true)
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongPOIErrorMessage);

                    done();
                });
        });

        it('should return an error message making a POST request to /pois since the poi\'s lng is blank', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            delete duplicatedPoi.poi.lng;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .set('Json', true)
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongPOIErrorMessage);

                    done();
                });
        });

        it('should return an error message making a POST request to /pois since the user doesn\'t exist', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            duplicatedPoi.userEmail = "fake@email.com";

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .set('Json', true)
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(notExistingUserErrorMessage);

                    done();
                });
        });

        /*
         * Removes all the POIs created during the test suite for createPOI.
         */
        after(function(done){
            POI.collection.remove({"_id": {$in: poisIds}}, function(){
                done();
            });
        });
    });

    /**
     * Tests for duplicatePOI functionality.
     */
    describe('#duplicatePOI', function(){

        var poisIds = [];
        var email2 = "email@test.com";

        var wrongBodyErrorMessage = "Usuario incorrecto";
        var nonExistingUserErrorMessage = "El usuario no existe";
        var nonExistingPoiErrorMessage = "El POI no existe";

        /*
         * It creates a new poi and a new user before the test suite for duplicatePOI starts executing.
         */
        before(function(done){

            var nPoi = new POI(poi);
            nPoi.save(function(err, result){
                poisIds.push(result._id);

                User.create({

                    email: email2,
                    name: name,
                    lastname: lastname,
                    password: hashPass,
                    firstLogin: true,
                    admin: false

                }, function(){
                    done();
                });
            });
        });

        it('should duplicate the desired POI in the users account making a POST request to /pois/id', function(done){

            chai.request(server)
                .post('/pois/'+poisIds[0].toString())
                .send({"userEmail":email2})
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('poi');
                    result.body.poi.should.be.a('object');
                    result.body.poi.should.have.property('_id');
                    result.body.poi._id.should.not.equal(poisIds[0]);
                    result.body.poi.should.have.property('name');
                    result.body.poi.name.should.equal(poi.name+"_duplicado");
                    result.body.poi.should.have.property('description');
                    result.body.poi.description.should.equal(poi.description);
                    result.body.poi.should.have.property('tags');
                    result.body.poi.tags.should.equal("#test#poitest");
                    result.body.poi.should.have.property('lat');
                    result.body.poi.lat.should.equal(poi.lat);
                    result.body.poi.should.have.property('lng');
                    result.body.poi.lng.should.equal(poi.lng);
                    result.body.poi.should.have.property('owner');
                    result.body.poi.owner.should.equal(email2);
                    result.body.poi.should.have.property('url');
                    result.body.poi.url.should.equal('');
                    result.body.poi.should.have.property('image');
                    result.body.poi.url.should.equal('');

                    poisIds.push(new ObjectId(result.body.poi._id));

                    done();

                });
        });

        it('should return an error message making a POST request to /pois/id since the user is blank', function(done){

            chai.request(server)
                .post('/pois/'+poisIds[0].toString())
                .send({"userEmail":""})
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongBodyErrorMessage);

                    done();

                });
        });

        it('should return an error message making a POST request to /pois/id since the user doesn\'t exist', function(done){

            chai.request(server)
                .post('/pois/'+poisIds[0].toString())
                .send({"userEmail":"fakeEmail"})
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(nonExistingUserErrorMessage);

                    done();

                });
        });

        it('should return an error message making a POST request to /pois/id since the POI doesn\'t exist', function(done){

            chai.request(server)
                .post('/pois/'+'58f7301f33073d1a24bc22e6')
                .send({"userEmail":email2})
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(nonExistingPoiErrorMessage);

                    done();

                });
        });

        /*
         * Removes all the POIs created during the test suite for duplicatePOI.
         */
        after(function(done){
            POI.collection.remove({"_id": {$in: poisIds}}, function(){
                User.collection.remove({"email":email2}, function(){
                    done();
                })
            });
        });
    });


    /**
     * Tests for deletePOI functionality.
     */
    describe('#deletePOI()', function(){

        var poiId;

        var poiDeletedSuccessfullyMessage = "POI eliminado correctamente";
        var wrongBodyErrorMessage = "Usuario incorrecto";
        var nonExistingUserErrorMessage = "El usuario no existe";
        var nonExistingPoiOrNotOwnerErrorMessage = "El POI no existe o no eres su propietario";

        /*
         * It creates a new poi and a new user before the test suite for duplicatePOI starts executing.
         */
        before(function(done){

            var nPoi = new POI(poi);
            nPoi.save(function(err, result){
                poiId = result._id.toString();

                User.create({

                    email: email2,
                    name: name,
                    lastname: lastname,
                    password: hashPass,
                    firstLogin: true,
                    admin: false

                }, function(){
                    done();
                });

            });
        });

        it('should delete the desired POI making a DELETE request to /pois/id', function(done){

            chai.request(server)
                .delete('/pois/'+poiId)
                .send({"userEmail":email})
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(true);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(poiDeletedSuccessfullyMessage);

                    done();
                });
        });

        it('should return an error message making a DELETE request to /pois/id since the user is blank', function(done){

            chai.request(server)
                .delete('/pois/'+poiId)
                .send({"userEmail":""})
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongBodyErrorMessage);

                    done();
                });
        });

        it('should return an error message making a DELETE request to /pois/id since the user doesn\'t exist', function(done){

            chai.request(server)
                .delete('/pois/'+poiId)
                .send({"userEmail":"fakeEmail"})
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(nonExistingUserErrorMessage);

                    done();
                });
        });

        it('should return an error message making a DELETE request to /pois/id since the POI doesn\'t exist', function(done){

            chai.request(server)
                .delete('/pois/'+'58f7301f33073d1a24bc22e6')
                .send({"userEmail":email})
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(nonExistingPoiOrNotOwnerErrorMessage);

                    done();
                });
        });

        it('should return an error message making a DELETE request to /pois/id since the user isn\'t the POI\'s owner', function(done){

            chai.request(server)
                .delete('/pois/'+poiId)
                .send({"userEmail":email2})
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(nonExistingPoiOrNotOwnerErrorMessage);

                    done();
                });
        });

        /*
         * Removes the user created at the begining of the tests for deletePOI.
         */
        after(function(done){
            User.collection.remove({"email": email2}, function(){
                done();
            });
        });

    });

    /**
     * Tests for modifyPOI functionality.
     */
    describe('#modifyPOI()', function(){

        var poiId;

        var poiModificationSuccessfulMessage = "POI actualizado correctamente";
        var wrongBodyFieldsErrorMessage = "Usuario o POI incorrectos";
        var wrongPoiFieldsErrorMessage = "Uno o más campos del POI son incorrectos";
        var wrongtagsErrorMessage = "Tags incorrectos";
        var notExistingUserErrorMessage = "El usuario no existe";
        var notExistingPoiorNotOwnerErrorMessage = "El POI no existe o no eres su propietario";

        /*
         * It creates a new poi and a new user before the test suite for duplicatePOI starts executing.
         */
        before(function(done){

            var nPoi = new POI(poi);
            nPoi.save(function(err, result){
                poiId = result._id;

                User.create({

                    email: email2,
                    name: name,
                    lastname: lastname,
                    password: hashPass,
                    firstLogin: true,
                    admin: false

                }, function(){
                    done();
                });

            });
        });

        it('should modify a POI making a PUT request to /pois/id', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            duplicatedPoi.poi.name += "_modified";

            chai.request(server)
                .put('/pois/'+poiId.toString())
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(true);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(poiModificationSuccessfulMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id since the user is blank', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            duplicatedPoi.name += "_modified";
            delete duplicatedPoi.userEmail;

            chai.request(server)
                .put('/pois/'+poiId.toString())
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongBodyFieldsErrorMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id since the poi is blank', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            delete duplicatedPoi.poi;

            chai.request(server)
                .put('/pois/'+poiId.toString())
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongBodyFieldsErrorMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id since the poi\'s name is blank', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            delete duplicatedPoi.poi.name;

            chai.request(server)
                .put('/pois/'+poiId.toString())
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongPoiFieldsErrorMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id since the poi\'s description is blank', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            delete duplicatedPoi.poi.description;

            chai.request(server)
                .put('/pois/'+poiId.toString())
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongPoiFieldsErrorMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id since the poi\'s tags are blank', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            delete duplicatedPoi.poi.tags;

            chai.request(server)
                .put('/pois/'+poiId.toString())
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongPoiFieldsErrorMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id since the poi\'s tags are wrong', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            duplicatedPoi.poi.tags = "test#POITEST";

            chai.request(server)
                .put('/pois/'+poiId.toString())
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongtagsErrorMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id since the poi\'s lat is blank', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            delete duplicatedPoi.poi.lat;

            chai.request(server)
                .put('/pois/'+poiId.toString())
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongPoiFieldsErrorMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id since the poi\'s lng is blank', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            delete duplicatedPoi.poi.lng;

            chai.request(server)
                .put('/pois/'+poiId.toString())
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongPoiFieldsErrorMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id since the user doesn\'t exist', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            duplicatedPoi.poi.name += "_modified";
            duplicatedPoi.userEmail = "fakeEmail";

            chai.request(server)
                .put('/pois/'+poiId.toString())
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(notExistingUserErrorMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id since the poi doesn\'t exist', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            duplicatedPoi.poi.name += "_modified";


            chai.request(server)
                .put('/pois/'+'58f7301f33073d1a24bc22e6')
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(notExistingPoiorNotOwnerErrorMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id since the user isn\'t the POI\'s owner', function(done){

            // Duplicates de poi object
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiRequest)));
            duplicatedPoi.poi.name += "_modified";
            duplicatedPoi.userEmail = email2;

            chai.request(server)
                .put('/pois/'+poiId)
                .send(duplicatedPoi)
                .set('Authorization','Bearer ' + createUserToken(email2, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(notExistingPoiorNotOwnerErrorMessage);

                    done();

                });
        });

        /*
         * Removes the POI and user created at the begening of the tests for modifyPOI.
         */
        after(function(done){
            POI.collection.remove({"_id": poiId}, function(){
                User.collection.remove({"email":email2}, function(){
                    done();
                })
            });
        });

    });

    describe('#ratePOI()', function(){

        var poiId;
        var rateSuccessfulMessage = "Valoración añadida correctamente.";
        var wrongRatingErrorMessage = "Valoración incorrecta.";
        var invalidRatingErrorMessage = "Valoración no válida. Indique una valoración entre 1 y 5.";
        var notExistingPoiErrorMessage = "El POI no existe.";

        /*
         * It creates a new poi before the test suite for ratePOI starts executing.
         */
        before(function(done){

            var nPoi = new POI(poi);
            nPoi.save(function(err, result){
                poiId = result._id;

                done();
            });
        });

        it('should add a new rating for the POI making a PUT request to /pois/id/rate', function(done){

            chai.request(server)
                .put('/pois/'+poiId+'/rate')
                .send({rating: 5})
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(true);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(rateSuccessfulMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id/rate since the rating field is blank', function(done){

            chai.request(server)
                .put('/pois/'+poiId+'/rate')
                .send({rating: ""})
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongRatingErrorMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id/rate since the rating is lower than 0', function(done){

            chai.request(server)
                .put('/pois/'+poiId+'/rate')
                .send({rating: -1})
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(invalidRatingErrorMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id/rate since the rating is greater than 5', function(done){

            chai.request(server)
                .put('/pois/'+poiId+'/rate')
                .send({rating: 6})
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(invalidRatingErrorMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /pois/id/rate since the POI doesn\'t exist', function(done){

            chai.request(server)
                .put('/pois/58f7301f33073d1a24bc22e6/rate')
                .send({rating: 0})
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(notExistingPoiErrorMessage);

                    done();

                });
        });


        /*
         * Removes the POI created at the begening of the tests for ratePOI.
         */
        after(function(done){
            POI.collection.remove({"_id": poiId}, function(){
                done();
            });
        });

    });

    /*
     * Removes the user created at the begining of the tests
     * after every test is finished.
     */
    after(function(done){
        User.collection.remove({"email": email}, function(){
            done();
        });
    });
});
