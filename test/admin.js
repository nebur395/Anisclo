var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var server = require('../server.js');
var User = server.models.User;
var createUserToken = require('./jwtCreator').createUserToken;

chai.use(chaiHttp);

/**
 * Test suite for Admin functionalities.
 */
describe('Admin', function(){

    var notAuthorizeErrorMessage = "No estás autorizado a acceder.";

    var name = "Testing";
    var lastname = "Test";
    var email = "testUser@email.com";
    var password = "testPass";
    var hashPass = require('crypto')
        .createHash('sha1')
        .update(password)
        .digest('base64');

    var name2 = "Test";
    var lastname2 = "Testing";
    var email2 = "prueba@email.com";
    var password2 = "passTest";
    var hashPass2 = require('crypto')
        .createHash('sha1')
        .update(password2)
        .digest('base64');

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
            admin: true

        }, function(){
            done();
        });
    });

    /**
     * Tests for getUsers functionality.
     */
    describe('#getUsers', function(){

        /*
         * It creates a new user before the test for getUsers starts executing.
         */
        before(function(done){

            User.create({

                email: email2,
                name: name2,
                lastname: lastname2,
                password: hashPass2,
                firstLogin: false,
                admin: false

            }, function(){
                done();
            });
        });

        it('should return a list with all the users in the system, except the admins, making a GET request to /admin/users', function(done){

            chai.request(server)
                .get('/admin/users')
                .set('Authorization','Bearer ' + createUserToken(email, false, true))
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('users');
                    result.body.users.should.be.a('array');
                    result.body.users.should.have.length.above(1);

                    var testUserIndex = result.body.users.length-1;

                    result.body.users[testUserIndex].should.have.property('email');
                    result.body.users[testUserIndex].email.should.equal(email2);
                    result.body.users[testUserIndex].should.have.property('name');
                    result.body.users[testUserIndex].name.should.equal(name2);
                    result.body.users[testUserIndex].should.have.property('lastname');
                    result.body.users[testUserIndex].lastname.should.equal(lastname2);
                    result.body.users[testUserIndex].should.have.property('admin');
                    result.body.users[testUserIndex].admin.should.equal(false);
                    result.body.users[testUserIndex].should.have.property('firstLogin');
                    result.body.users[testUserIndex].firstLogin.should.equal(false);
                    result.body.users[testUserIndex].should.have.property('favs');
                    result.body.users[testUserIndex].favs.should.be.a('array');
                    result.body.users[testUserIndex].favs.should.be.have.lengthOf(0);
                    result.body.users[testUserIndex].should.have.property('follows');
                    result.body.users[testUserIndex].follows.should.be.a('array');
                    result.body.users[testUserIndex].follows.should.be.have.lengthOf(0);
                    result.body.users[testUserIndex].should.have.property('isActive');
                    result.body.users[testUserIndex].isActive.should.equal(true);
                    result.body.users[testUserIndex].should.have.property('ban');
                    result.body.users[testUserIndex].ban.should.equal(-1);

                    done();
                });
        });

        it('should return an error message since the user\'s credentials have no admin authorization making a GET request to /admin/users', function(done){

            chai.request(server)
                .get('/admin/users')
                .set('Authorization','Bearer ' + createUserToken(email, false, false))
                .end(function(err, result){

                    result.should.have.status(401);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(notAuthorizeErrorMessage);

                    done();
                });
        });

        /*
         * Removes the user created before the getUsers tests.
         */
        after(function(done){
            User.collection.remove({"email": email2});
            done();
        });

    });

    /**
     * Tests for getUsers functionality.
     */
    describe('#modifyUser', function(){

        var modificationSuccessfulMessage = "Usuario actualizado correctamente";
        var jsonHeaderMissingErrorMessage = "El campo 'Json' de las cabeceras no existe o no es válido.";
        var notExistingUserErrorMessage = "El usuario no existe";
        var missingFieldInModifyRequestErrorMessage = "Nombre, apellido o nuevo email incorrectos";

        /*
         * It creates a new user before the test for modifyUser starts executing.
         */
        before(function(done){

            User.create({

                email: email2,
                name: name2,
                lastname: lastname2,
                password: hashPass2,
                firstLogin: false,
                admin: false

            }, function(){
                done();
            });
        });

        it('should modify a user making a PUT request to /admin/users/email', function(done){

            chai.request(server)
                .put('/admin/users/'+email2)
                .send({name: name2+'_modified', lastname:lastname2+'_modified', newEmail:email2})
                .set('Authorization','Bearer ' + createUserToken(email, false, true))
                .set('Json', true)
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(true);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(modificationSuccessfulMessage);

                    done();

                });
        });

        it('should return an error message since the user\'s credentials have no admin authorization making a PUT request to /admin/users/email', function(done) {

            chai.request(server)
                .put('/admin/users/' + email2)
                .send({name: name2 + '_modified', lastname: lastname2 + '_modified', newEmail: email2})
                .set('Authorization', 'Bearer ' + createUserToken(email, false, false))
                .set('Json', true)
                .end(function (err, result) {

                    result.should.have.status(401);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(notAuthorizeErrorMessage);

                    done();

                });
        });

        it('should return an error message since the \'Json\' header is blank making a PUT request to /admin/users/email', function(done) {

            chai.request(server)
                .put('/admin/users/' + email2)
                .send({name: name2 + '_modified', lastname: lastname2 + '_modified', newEmail: email2})
                .set('Authorization', 'Bearer ' + createUserToken(email, false, true))
                .set('Json', "")
                .end(function (err, result) {

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(jsonHeaderMissingErrorMessage);

                    done();

                });
        });

        it('should return an error message since the user to modify does not exist making a PUT request to /admin/users/email', function(done) {

            chai.request(server)
                .put('/admin/users/fakeEmail')
                .send({name: name2 + '_modified', lastname: lastname2 + '_modified', newEmail: email2})
                .set('Authorization', 'Bearer ' + createUserToken(email, false, true))
                .set('Json', true)
                .end(function (err, result) {

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(notExistingUserErrorMessage);

                    done();

                });
        });

        it('should return an error message since the name field for the user is blank making a PUT request to /admin/users/email', function(done) {

            chai.request(server)
                .put('/admin/users/'+email2)
                .send({name: "", lastname: lastname2 + '_modified', newEmail: email2})
                .set('Authorization', 'Bearer ' + createUserToken(email, false, true))
                .set('Json', true)
                .end(function (err, result) {

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(missingFieldInModifyRequestErrorMessage);

                    done();

                });
        });

        it('should return an error message since the lastname field for the user is blank making a PUT request to /admin/users/email', function(done) {

            chai.request(server)
                .put('/admin/users/'+email2)
                .send({name: name2 + '_modified', lastname: "", newEmail: email2})
                .set('Authorization', 'Bearer ' + createUserToken(email, false, true))
                .set('Json', true)
                .end(function (err, result) {

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(missingFieldInModifyRequestErrorMessage);

                    done();

                });
        });

        it('should return an error message since the newEmail field for the user is blank making a PUT request to /admin/users/email', function(done) {

            chai.request(server)
                .put('/admin/users/'+email2)
                .send({name: name2 + '_modified', lastname: lastname2 + '_modified', newEmail: ""})
                .set('Authorization', 'Bearer ' + createUserToken(email, false, true))
                .set('Json', true)
                .end(function (err, result) {

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(missingFieldInModifyRequestErrorMessage);

                    done();

                });
        });

        /*
         * Removes the user created before the getUsers tests.
         */
        after(function(done){
            User.collection.remove({"email": email2});
            done();
        });
    });

    describe('#banUser', function(){

        var banSuccessfulMessage = "Usuario baneado correctamente";
        var wrongBanTimeErrorMessage = "Tiempo de baneo incorrecto";
        var notExistingUserErrorMessage = "El usuario no existe";

        /*
         * It creates a new user before the test for modifyUser starts executing.
         */
        before(function(done){

            User.create({

                email: email2,
                name: name2,
                lastname: lastname2,
                password: hashPass2,
                firstLogin: false,
                admin: false

            }, function(){
                done();
            });
        });

        it('should ban a user permanently making a PUT request to /admin/users/email/ban', function(done){

            chai.request(server)
                .put('/admin/users/'+email2+'/ban')
                .send({time: 0})
                .set('Authorization', 'Bearer ' + createUserToken(email, false, true))
                .set('Json', true)
                .end(function (err, result) {

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(true);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(banSuccessfulMessage);

                    done();

                });
        });

        it('should ban a user temporarily making a PUT request to /admin/users/email/ban', function(done){

            chai.request(server)
                .put('/admin/users/'+email2+'/ban')
                .send({time: 10})
                .set('Authorization', 'Bearer ' + createUserToken(email, false, true))
                .set('Json', true)
                .end(function (err, result) {

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(true);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(banSuccessfulMessage);

                    done();

                });
        });

        it('should return an error message since the user\'s credentials have no admin authorization making a PUT request to /admin/users/email/ban', function(done){

            chai.request(server)
                .put('/admin/users/'+email2+'/ban')
                .send({time: 10})
                .set('Authorization', 'Bearer ' + createUserToken(email, false, false))
                .set('Json', true)
                .end(function (err, result) {

                    result.should.have.status(401);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(notAuthorizeErrorMessage);

                    done();

                });
        });

        it('should return an error message since the time field is blank making a PUT request to /admin/users/email/ban', function(done){

            chai.request(server)
                .put('/admin/users/'+email2+'/ban')
                .send({time: ""})
                .set('Authorization', 'Bearer ' + createUserToken(email, false, true))
                .set('Json', true)
                .end(function (err, result) {

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongBanTimeErrorMessage);

                    done();

                });
        });

        it('should return an error message since the ban time is negative making a PUT request to /admin/users/email/ban', function(done){

            chai.request(server)
                .put('/admin/users/'+email2+'/ban')
                .send({time: -1})
                .set('Authorization', 'Bearer ' + createUserToken(email, false, true))
                .set('Json', true)
                .end(function (err, result) {

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(wrongBanTimeErrorMessage);

                    done();

                });
        });

        it('should return an error message since user does not exist making a PUT request to /admin/users/email/ban', function(done){

            chai.request(server)
                .put('/admin/users/fakeUser/ban')
                .send({time: 0})
                .set('Authorization', 'Bearer ' + createUserToken(email, false, true))
                .set('Json', true)
                .end(function (err, result) {

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
         * Removes the user created before the getUsers tests.
         */
        after(function(done){
            User.collection.remove({"email": email2});
            done();
        });
    });

    describe('#unbanUser', function(){

        var unbanSuccessfulMessage = "Usuario desbaneado correctamente";
        var notExistingUserErrorMessage = "El usuario no existe";

        /*
         * It creates a new user before the test for modifyUser starts executing.
         */
        before(function(done){

            User.create({

                email: email2,
                name: name2,
                lastname: lastname2,
                password: hashPass2,
                firstLogin: false,
                admin: false

            }, function(){
                done();
            });
        });

        it('should unban a user making a PUT request to /admin/users/email/unban', function(done){

            chai.request(server)
                .put('/admin/users/'+email2+'/unban')
                .set('Authorization', 'Bearer ' + createUserToken(email, false, true))
                .set('Json', true)
                .end(function (err, result) {

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(true);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(unbanSuccessfulMessage);

                    done();

                });
        });

        it('should return an error message since the user\'s credentials have no admin authorization making a PUT request to /admin/users/email/unban', function(done){

            chai.request(server)
                .put('/admin/users/'+email2+'/unban')
                .send({time: 10})
                .set('Authorization', 'Bearer ' + createUserToken(email, false, false))
                .set('Json', true)
                .end(function (err, result) {

                    result.should.have.status(401);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(notAuthorizeErrorMessage);

                    done();

                });
        });

        it('should return an error message since user does not exist making a PUT request to /admin/users/email/ban', function(done){

            chai.request(server)
                .put('/admin/users/fakeUser/ban')
                .send({time: 0})
                .set('Authorization', 'Bearer ' + createUserToken(email, false, true))
                .set('Json', true)
                .end(function (err, result) {

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
         * Removes the user created before the getUsers tests.
         */
        after(function(done){
            User.collection.remove({"email": email2});
            done();
        });
    });

    /*
     * Removes the user created before the Admin test suite.
     */
    after(function(done){
        User.collection.remove({"email": email});
        done();
    });

});
