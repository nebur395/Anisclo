var chai = require('chai');
var chaiHttp = require('chai-http');
var should = chai.should();
var server = require('../server.js');
var User = server.models.User;
var jwt = require ('jsonwebtoken');
var createUserToken = require('./jwtCreator').createUserToken;

chai.use(chaiHttp);

/**
 * Test suite for User functionalities.
 */
describe('User', function(){

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
            admin: false

        }, function(){
            done();
        });
    });

    /**
     * Tests for signUp functionality.
     */
    describe('#signUp()', function(){

        var singUpSuccessMessage = "Usuario creado correctamente. Comprueba tu correo para confirmar tu cuenta.";
        var signUpErrorMessage = "Ya existe una cuenta con ese correo.";
        var signUpBlankFieldMessage = "Nombre, apellido o email incorrectos";


        it('should sign up a new user making a POST request to /users', function(done){

            chai.request(server)
                .post('/users/')
                .send({name:name2, lastname:lastname2, email:email2})
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(true);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(singUpSuccessMessage);

                    done();

                });
        });

        it('should return an error message making a POST request to /users since the user already exists', function(done){

            chai.request(server)
                .post('/users/')
                .send({name:name, lastname:lastname, email:email})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(signUpErrorMessage);

                    done();
                });
        });

        it('should return an error message making a POST request to /users since name is blank', function(done){

            chai.request(server)
                .post('/users/')
                .send({name:"", lastname:lastname, email:email})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(signUpBlankFieldMessage);

                    done();
                });
        });

        it('should return an error message making a POST request to /users since lastname is blank', function(done){

            chai.request(server)
                .post('/users/')
                .send({name:name, lastname:"", email:email})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(signUpBlankFieldMessage);

                    done();
                });
        });

        it('should return an error message making a POST request to /users since email is blank', function(done){

            chai.request(server)
                .post('/users/')
                .send({name:name, lastname:name, email:""})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(signUpBlankFieldMessage);

                    done();
                });
        });

        /*
         * Removes the user created during the signIn tests.
         */
        after(function(done){
            User.collection.remove({"email":email2});
            done();
        });

    });

    /**
     * Tests for logIn functionality.
     */
    describe("#logIn()", function(){

        var loginErrorMessage = "Email o contraseña incorrectos";

        it('should successfully login the user returnin it\'s profile information making a GET request to /users/login', function(done){

            chai.request(server)
                .get('/users/login')
                .auth(email, password)
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('token');
                    var token = result.body.token;
                    jwt.verify(token, app.get('secret'), function (err, decoded) {
                        var user = decoded;
                        user.should.be.a('object');
                        user.should.have.property('email');
                        user.email.should.equal(email);
                        user.should.have.property('name');
                        user.name.should.equal(name);
                        user.should.have.property('lastname');
                        user.lastname.should.equal(lastname);
                        user.should.have.property('firstLogin');
                        user.firstLogin.should.equal(true);
                        user.should.have.property('favs');
                        user.favs.should.be.an.instanceOf(Array);
                        user.favs.should.have.lengthOf(0);
                        user.should.have.property('admin');
                        user.admin.should.equal(false);
                        done();
                    });

                });
        });

        it('should return an error message making a GET request to /users/login since the user doesn\'t exist', function(done){

            chai.request(server)
                .get('/users/login')
                .auth(email2, password)
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(loginErrorMessage);

                    done();
                });
        });

        it('should return an error message making a GET request to /users/login since the user\'s password is wrong', function(done){

            chai.request(server)
                .get('/users/login')
                .auth(email, "wrongPass")
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(loginErrorMessage);

                    done();
                });
        });

        it('should return an error message making a GET request to /users/login since the email is blank', function(done){

            chai.request(server)
                .get('/users/login')
                .auth("", password)
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(loginErrorMessage);

                    done();
                });
        });

        it('should return an error message making a GET request to /users/login since the password is blank', function(done){

            chai.request(server)
                .get('/users/login')
                .auth(email, "")
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(loginErrorMessage);

                    done();
                });
        });
    });


    /**
     * Tests for retrievePass functionality.
     */
    describe("#retrievePass()", function(){

        var successRetrievingMessage = "Nueva contraseña generada. Comprueba tu correo para inciar sesión con ella.";
        var errorRetrievingMessage = "El usuario no existe";

        /*
         * It creates a new user before the retrievePass tests start executing.
         */
        before(function(done){

            User.create({

                email: email2,
                name: name2,
                lastname: lastname2,
                firstLogin: true,
                admin: false

            }, function(){
                done();
            });
        });

        it('should send an email to the user with it\'s new password making a PUT request to /users/retrievePass', function(done){

            chai.request(server)
                .put('/users/retrievePass')
                .send({email: email2})
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(true);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(successRetrievingMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /users/retrievePass since the user doesn\'t exist', function(done){

            chai.request(server)
                .put('/users/retrievePass')
                .send({email: "falseEmail"})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(errorRetrievingMessage);

                    done();

                });
        });

        it('should return an error message making a PUT request to /users/retrievePass since the user is blank', function(done){

            chai.request(server)
                .put('/users/retrievePass')
                .send({email: ""})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(errorRetrievingMessage);

                    done();

                });
        });

        /*
         * Removes the user created before the retrievePass tests.
         */
        after(function(done){
           User.collection.remove({"email": email2});
            done();
        });

    });

    describe("#confirm()", function(){

        var confirmationSuccessMessage = "Confirmación completada. Comprueba tu correo para iniciar sesión con tu contraseña.";
        var confirmationErrorMessage = "El usuario no existe";

        /*
         * It creates a new user before the confirm tests start executing.
         */
        before(function(done){

            User.create({

                email: email2,
                name: name2,
                lastname: lastname2,
                firstLogin: true,
                admin: false

            }, function(){
                done();
            });
        });

        it('should send an email to the user with it\'s new password making a GET request to /users/confirm/:email', function(done){

            chai.request(server)
                .get('/users/confirm/'+email2)
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(true);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(confirmationSuccessMessage);

                    done();

                });
        });

        it('should return an error message making a GET request to /users/confirm/:email since the user doesn\'t exist', function(done){

            chai.request(server)
                .get('/users/confirm/falseEmail')
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(confirmationErrorMessage);

                    done();

                });
        });

        /*
         * Removes the user created before the confirm tests.
         */
        after(function(done){
            User.collection.remove({"email": email2});
            done();
        });
    });

    describe("#changePass()", function(){

        var updateSuccessMessage = "Usuario actualizado correctamente";
        var updateWrongPass = "Email o contraseña actual incorrectos";
        var missingPasswordsMessage = "Contraseña incorrecta";

        /*
         * It creates a new user before the changePass tests start executing.
         */
        before(function(done){

            User.create({

                email: email2,
                name: name2,
                lastname: lastname2,
                password: hashPass2,
                firstLogin: true,
                admin: false

            }, function(){
                done();
            });
        });

        it('should update the user\'s password making a PUT request to /users/:email', function(done){

            chai.request(server)
                .put('/users/'+email2)
                .send({current: password2, new: "newPass"})
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(true);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(updateSuccessMessage);

                    done();
                });
        });

        it('should return an error message making a PUT request to /users/:email since the user doesn\'t exist', function(done){

            chai.request(server)
                .put('/users/falseEmail')
                .send({current: password2, new: "newPass"})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(updateWrongPass);

                    done();
                });
        });


        it('should return an error message making a PUT request to /users/:email since the password is wrong', function(done){

            chai.request(server)
                .put('/users/'+email2)
                .send({current: "wrongPass", new: "newPass"})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(updateWrongPass);

                    done();
                });
        });

        it('should return an error message making a PUT request to /users/:email since the current password is blank', function(done){

            chai.request(server)
                .put('/users/'+email2)
                .send({current: "", new: "newPass"})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(missingPasswordsMessage);

                    done();
                });
        });

        it('should return an error message making a PUT request to /users/:email since the new password is blank', function(done){

            chai.request(server)
                .put('/users/'+email2)
                .send({current: password2, new: ""})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(missingPasswordsMessage);

                    done();
                });
        });

        /*
         * Removes the user created before the changePass tests.
         */
        after(function(done){
            User.collection.remove({"email": email2});
            done();
        });

    });


    describe("#deleteUser()", function(){

        var deleteSuccessMessage = "Usuario eliminado correctamente";
        var deleteWrongPassOrUserMessage = "Email o contraseña incorrectos";
        var deleteWrongPassMessage = "Contraseña incorrecta";

        /*
         * It creates a new user before the deleteUser tests start executing.
         */
        before(function(done){

            User.create({

                email: email2,
                name: name2,
                lastname: lastname2,
                password: hashPass2,
                firstLogin: true,
                admin: false

            }, function(){
                done();
            });
        });

        it('should delete the user making a DELETE request to /users/email', function(done){

            chai.request(server)
                .delete('/users/'+email2)
                .send({current: password2})
                .end(function(err, result){

                    result.should.have.status(200);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(true);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(deleteSuccessMessage);

                    done();
                });
        });

        it('should return an error message making a DELETE request to /users/email since the user doesn\'t exist', function(done){

            chai.request(server)
                .delete('/users/falseEmail')
                .send({current: password2})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(deleteWrongPassOrUserMessage);

                    done();
                });
        });

        it('should return an error message making a DELETE request to /users/email since the password is wrong', function(done){

            chai.request(server)
                .delete('/users/'+email)
                .send({current: "wrongPass"})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(deleteWrongPassOrUserMessage);

                    done();
                });
        });

        it('should return an error message making a DELETE request to /users/email since the password is blank', function(done){

            chai.request(server)
                .delete('/users/'+email2)
                .send({current: ""})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.body.should.be.a('object');
                    result.body.should.have.property('success');
                    result.body.success.should.equal(false);
                    result.body.should.have.property('message');
                    result.body.message.should.equal(deleteWrongPassMessage);

                    done();
                });
        });

        /*
         * Removes the user created during the deleteUser tests.
         */
        after(function(done){
            User.collection.remove({"email":email2});
            done();
        });


    });

    /*
     * Removes the user created at the begining of the tests
     * after every test is finished.
     */
    after(function(done){
        User.collection.remove({"email":email});
        done();
    });
});
