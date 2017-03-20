var http = require("http");
var express = require('express');
var base64 = require('base-64');
var utf8 = require('utf8');
var randomstring = require('randomstring');
var nodemailer = require('nodemailer');

module.exports = function (app) {

	var router = express.Router();

    var User = app.models.User;

    /**
     * @swagger
     * definition:
     *   User:
     *     properties:
     *       userEmail:
     *         type: string
     *       userPassword:
     *         type: string
     */

    /**
     * @swagger
     * /users/:
     *   post:
     *     tags:
     *       - Users
     *     description: Creates a new user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userInfo
     *         description: User's email and password
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/User'
     *     responses:
     *       200:
     *         description: Successfully created
     */

    /**
     * Creates a new user in the system
     */
	router.post("/", function(req,res){

        // Checks all body fields
        if(!req.body.name || !req.body.lastname || !req.body.email){
            res.status(404).send("Nombre, apellido o email incorrectos");
            return;
        }

        var hashPass = require('crypto')
            .createHash('sha1')
            .update("pass")
            .digest('base64');

        console.log("Nombre: "+req.body.name+" Apellido: "+req.body.lastname+" Email: "+req.body.email);
        User.create({

            email: req.body.email,
            password: hashPass,
            name: req.body.name,
            lastname: req.body.lastname,
            firstLogin: true,
            admin: false

        }, function (err, result){

            if(err){
                res.status(500).send("Error guardando datos");
            }
            else{
                res.status(200).send("Usuario creado correctamente");
            }
        });
    });


    /**
     * Logs the user in if it's registered.
     */
    router.get("/login", function(req, res){

        // Gets the Authorization header and retrieves and decodes the credentials.
        var auth = req.headers["authorization"];
        var bytes = base64.decode(auth.substring(6));
        var credentials = utf8.decode(bytes);
        var index = credentials.indexOf(":");
        var email = credentials.substring(0, index);
        var pass = credentials.substring(index+1);
        console.log("Usuario: "+email+" Pass: "+pass);

        // Looks for the user
        User.findOne({email: email}, function(err, result){

            if (err){
                res.status(500).send("Error recuperando datos");
                return;
            }

            // Hashes the password in order to compare it with the stored one
            var hashPass = require('crypto')
                .createHash('sha1')
                .update(pass)
                .digest('base64');

            // If there's a user with that email and the password is correct
            if(result && hashPass===result.password){

                res.status(200).send({
                        "email": result.email,
                        "name": result.name,
                        "lastname": result.lastname,
                        "firstLogin": result.firstLogin,
                        "admin": result.admin
                });
            }
            // If there's no user with that email or the password is incorrect
            else{
                res.status(404).send("Email o contraseña incorrectos");
            }
        });
    });

    /**
     * Confirms a new user account creating a new random pass for it
     * and sending it by email.
     *
     * NOTE: E-mail sending is not yet working
     */
    router.put("/confirm", function(req, res){

        var randomPass = randomstring.generate(8);
        var hashPass = require('crypto')
            .createHash('sha1')
            .update(randomPass)
            .digest('base64');

        User.findOneAndUpdate({email: req.body.email}, {password: hashPass}, function(err, result){
           if(err){
               res.status(500).send("Error borrando usuario");
               return;
           }
            if(result===null){
                res.status(404).send("El usuario no existe");
            }
            else{
                res.status(200).send("Contraseña generada correctamente");
            }
        });

    });

    /**
     * Creates a new random password for a user and sends it
     * by email in order to allow him/her to access the system
     * if it's previous password was forgotten.
     *
     */
    router.put("/retrievePass", function(req, res){

        var randomPass = randomstring.generate(8);
        var hashPass = require('crypto')
            .createHash('sha1')
            .update(randomPass)
            .digest('base64');

        User.findOneAndUpdate({email: req.body.email}, {password: hashPass, firstLogin: true}, function(err, result){
            if(err){
                res.status(500).send("Error borrando usuario");
                return;
            }
            if(result===null){
                res.status(404).send("El usuario no existe");
            }
            else{
                var mailOptions = {
                    from: 'No-Reply <verif.anisclo@gmail.com>',
                    to: req.body.email,
                    subject: 'Pirineo POI password retrieving',
                    html: 'Whoop! It seems you have lost your password.</p>' +
                    '<p>Your new password is \"'+randomPass+'\".</p>' +
                    '<p>You will be forced to change this password in your next Login.</p>' +
                    '<p>The Pirineos POI team.</p>'
                };
                sendEmail(mailOptions, res);
            }
        });

    });

    /**
     * @swagger
     * /users/{id}:
     *   get:
     *     tags:
     *       - Users
     *     description: Returns a single user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: User's id
     *         in: path
     *         required: true
     *         type: integer
     *     responses:
     *       200:
     *         description: A single user
     *         schema:
     *           $ref: '#/definitions/User'
     */
    router.get("/:email", function(req,res){
        User.findOne({email: req.params.email},function(err,data){
            if(err) {
                res.status(500).send("Error recuperando datos");
            }
            else {
                res.status(200).send(data);
            }
        });
    });

    /**
     * @swagger
     * /users/{id}:
     *   put:
     *     tags:
     *       - Users
     *     description: Updates a single user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: Users's id
     *         in: path
     *         required: true
     *         type: integer
     *       - name: user
     *         in: body
     *         description: Fields for the User resource
     *         schema:
     *           type: array
     *           $ref: '#/definitions/User'
     *     responses:
     *       200:
     *         description: Successfully updated
     */

    /**
     * Updates the user's password
     */
    router.put("/:email", function(req,res){

        if(!req.body.current || !req.body.new){
            res.status(404).send("Contraseña incorrecta");
            return;
        }

        User.findOne({email: req.params.email}, function(err, result){

            if (err){
                res.status(500).send("Error recuperando datos");
                return;
            }

            var hashPass = require('crypto')
                .createHash('sha1')
                .update(req.body.current)
                .digest('base64');
            console.log(result);
            if(result && hashPass===result.password){

                var hashPass = require('crypto')
                    .createHash('sha1')
                    .update(req.body.new)
                    .digest('base64');

                User.update({email: req.params.email}, {password:hashPass, firstLogin: false},function(err,data){

                    if(err) {
                        res.status(500).send("Error borrando usuario");
                        return;
                    }

                    res.status(200).send("Usuario actualizado correctamente");

                });
            }
            else{
                res.status(404).send("Email o contraseña incorrectos");
            }
        });
    });

    /**
     * @swagger
     * /users/{id}:
     *   delete:
     *     tags:
     *       - Users
     *     description: Deletes a single user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: Users's id
     *         in: path
     *         required: true
     *         type: integer
     *     responses:
     *       200:
     *         description: Successfully deleted
     */

    /**
     * Removes the user with the corresponding email from the system
     */
    router.delete("/:email", function(req,res){
        console.log("Email: "+req.params.email);

        User.findOne({email: req.params.email}, function(err, result){

            if (err){
                res.status(500).send("Error recuperando datos");
                return;
            }
            // Hashes the password in order to compare it with the stored one
            var hashPass = require('crypto')
                .createHash('sha1')
                .update(req.body.current)
                .digest('base64');

            // If the user exists and the password is correct
            if(result && hashPass===result.password){

                User.remove({email: req.params.email},function(err,result){

                    if(err) {
                        res.status(500).send("Error borrando usuario");
                        return;
                    }

                    res.status(200).send("Usuario eliminado correctamente");
                });
            }
            // If the user doesn't exists or the password is incorrect
            else{
                res.status(404).send("Email o contraseña incorrectos");
            }
        });

    });

    function sendEmail(mailOptions, res){

        var smtpTransport = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "verif.anisclo@gmail.com",
                pass: "AniscloPOI"
            }
        });
        smtpTransport.sendMail(mailOptions,function(error,response){
            if(error){
                console.log(error);
            }
            else{
                res.status(200).send("\"Email enviado correctamente\"");
            }
        });


    }

    return router;

};
