var chai = require('chai');
var chaiHttp = require('chai-http');
var shoudl = chai.should();
var server = require('../server.js');
var User = server.models.User;

chai.use(chaiHttp);

describe('User', function(){

    describe('#signUp()', function(){

        var singUpSuccessMessage = "Usuario creado correctamente. Comprueba tu correo para confirmar tu cuenta.";
        var signUpErrorMessage = "Error guardando datos";
        var signUpBlankFieldMessage = "Nombre, apellido o email incorrectos";

        var name = "Testing";
        var lastname = "Test";
        var email = "test@email.com";

        var name2 = "Test";
        var lastname2 = "Testing";
        var email2 = "prueba@email.com";

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

        it('should sign up a new user making a POST request to /users', function(done){

            chai.request(server)
                .post('/users')
                .send({name:name, lastname:lastname, email:email})
                .end(function(err, result){

                    result.should.have.status(200);
                    result.text.should.equal(singUpSuccessMessage);

                    done();

                });
        });

        it('should return an error message making a POST request to /users since the user already exists', function(done){

            chai.request(server)
                .post('/users')
                .send({name:name2, lastname:lastname2, email:email2})
                .end(function(err, result){

                    result.should.have.status(500);
                    result.text.should.equal(signUpErrorMessage);

                    done();
                });
        });

        it('should return an error message making a POST request to /users since name is blank', function(done){

            chai.request(server)
                .post('/users')
                .send({name:"", lastname:lastname2, email:email2})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.text.should.equal(signUpBlankFieldMessage);

                    done();
                });
        });

        it('should return an error message making a POST request to /users since lastname is blank', function(done){

            chai.request(server)
                .post('/users')
                .send({name:name2, lastname:"", email:email2})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.text.should.equal(signUpBlankFieldMessage);

                    done();
                });
        });

        it('should return an error message making a POST request to /users since email is blank', function(done){

            chai.request(server)
                .post('/users')
                .send({name:name2, lastname:name2, email:""})
                .end(function(err, result){

                    result.should.have.status(404);
                    result.text.should.equal(signUpBlankFieldMessage);

                    done();
                });
        });


        after(function(done){
            User.collection.remove({"email":email});
            User.collection.remove({"email":email2});
            done();
        });
    });
});


