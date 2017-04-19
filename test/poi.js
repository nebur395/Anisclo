var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var server = require('../server.js');
var User = server.models.User;
var POI = server.models.POI;
var ObjectId = require('mongoose').Types.ObjectId;

chai.use(chaiHttp);

/**
 * Test suite for POI functionalities.
 */
describe('POI', function(){

    var name = "Testing";
    var lastname = "Test";
    var email = "test@email.com";
    var password = "testPass";
    var hashPass = require('crypto')
        .createHash('sha1')
        .update(password)
        .digest('base64');

    var poiToCreate = {
        "userEmail": email,
        "poi": {
            "name": "TestPOI",
            "description": "A test POI",
            "tags": "#test#POITEST",
            "lat": 41.64469659784919,
            "lng": -0.8703231811523438
        }
    };

    var poi = {

        "name": "TestPOI",
        "description": "A test POI",
        "tags": ['test', 'poitest'],
        "lat": 41.64469659784919,
        "lng": -0.8703231811523438,
        "owner": email
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
                .send(poiToCreate)
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('poi');
                    result.body.poi.should.be.a('object');
                    result.body.poi.should.have.property('_id');
                    result.body.poi.should.have.property('name');
                    result.body.poi.name.should.equal(poiToCreate.poi.name);
                    result.body.poi.should.have.property('description');
                    result.body.poi.description.should.equal(poiToCreate.poi.description);
                    result.body.poi.should.have.property('tags');
                    result.body.poi.tags.should.equal(poiToCreate.poi.tags.toLowerCase());
                    result.body.poi.should.have.property('lat');
                    result.body.poi.lat.should.equal(poiToCreate.poi.lat);
                    result.body.poi.should.have.property('lng');
                    result.body.poi.lng.should.equal(poiToCreate.poi.lng);
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
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiToCreate)));
            duplicatedPoi.poi.url = url;
            duplicatedPoi.poi.image = image;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('poi');
                    result.body.poi.should.be.a('object');
                    result.body.poi.should.have.property('_id');
                    result.body.poi.should.have.property('name');
                    result.body.poi.name.should.equal(poiToCreate.poi.name);
                    result.body.poi.should.have.property('description');
                    result.body.poi.description.should.equal(poiToCreate.poi.description);
                    result.body.poi.should.have.property('tags');
                    result.body.poi.tags.should.equal(poiToCreate.poi.tags.toLowerCase());
                    result.body.poi.should.have.property('lat');
                    result.body.poi.lat.should.equal(poiToCreate.poi.lat);
                    result.body.poi.should.have.property('lng');
                    result.body.poi.lng.should.equal(poiToCreate.poi.lng);
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
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiToCreate)));
            delete duplicatedPoi.userEmail;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
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
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiToCreate)));
            delete duplicatedPoi.poi;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
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
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiToCreate)));
            delete duplicatedPoi.poi.name;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
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
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiToCreate)));
            delete duplicatedPoi.poi.description;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
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
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiToCreate)));
            delete duplicatedPoi.poi.tags;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
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
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiToCreate)));
            duplicatedPoi.poi.tags = "test#POITEST";

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
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
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiToCreate)));
            delete duplicatedPoi.poi.lat;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
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
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiToCreate)));
            delete duplicatedPoi.poi.lng;

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
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
            var duplicatedPoi = (JSON.parse(JSON.stringify(poiToCreate)));
            duplicatedPoi.userEmail = "fake@email.com";

            chai.request(server)
                .post('/pois')
                .send(duplicatedPoi)
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
         * It creates a new poi before the test suite for duplicatePOI starts executing.
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
            console.log(poisIds);
            POI.collection.remove({"_id": {$in: poisIds}}, function(){
                done();
            });
        });

    });
});
