var http = require("http");
var express = require('express');
var base64 = require('base-64');
var utf8 = require('utf8');
var randomstring = require('randomstring');
var nodemailer = require('nodemailer');
var ip = require('ip');
var request = require('request');

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
     * SignUp
     *
     * Creates a new user in the system
     */
	router.post("/", function(req,res){

        // Checks all body fields
        if(!req.body.name || !req.body.lastname || !req.body.email){ //|| !req.body.captcha
            res.status(404).send("Nombre, apellido o email incorrectos");
            return;
        }

        /*request.post(
            'https://www.google.com/recaptcha/api/siteverify',
            { json: {
                "secret": '<PRIVATE KEY>',
                "response": req.body.captcha
            } },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
            }
        );*/

        console.log("Nombre: "+req.body.name+" Apellido: "+req.body.lastname+" Email: "+req.body.email);
        User.create({

            email: req.body.email,
            name: req.body.name,
            lastname: req.body.lastname,
            firstLogin: true,
            admin: false

        }, function (err, result){

            if(err){
                res.status(500).send("Error guardando datos");
            }
            else{
                var url = "http://"+ip.address()+":8080/users/confirm/"+req.body.email;
                var message = "Usuario creado correctamente. Comprueba tu correo para confirmar tu cuenta.";
                var mailOptions = {
                    from: 'No-Reply <verif.anisclo@gmail.com>',
                    to: req.body.email,
                    subject: 'Pirineo\'s POI account confirmation',
                    html: 'Hello there! Wellcome to Pirineo\'s POI.</p>' +
                    '<p>Click on the link below to confim you account and get your password :)</p>' +
                    '<a href='+url+' target="_blank">'+url+'</a>'+
                    '<p>The Pirineo\'s POI team.</p>'
                };
                sendEmail(mailOptions, res, message);
            }
        });
    });


    /**
     * LogIn
     *
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
        console.log("Email: "+email+" Pass: "+pass);

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
     * Retrieve Password
     *
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
                res.status(500).send("Error recuperando y actualizando datos");
                return;
            }
            if(result===null){
                res.status(404).send("El usuario no existe");
            }
            else{
                var message = "Nueva contraseña generada. Comprueba tu correo para inciar sesión con ella.";
                var mailOptions = {
                    from: 'No-Reply <verif.anisclo@gmail.com>',
                    to: req.body.email,
                    subject: 'Pirineo\'s POI password retrieving',
                    html: 'Whoops! It seems you have lost your password.</p>' +
                    '<p>Your new password is \"'+randomPass+'\".</p>' +
                    '<p>For your own security, you will be forced to change it after your first login.</p>' +
                    '<p>The Pirineo\'s POI team.</p>'
                };
                sendEmail(mailOptions, res, message);
            }
        });
    });

    /**
     * Confirm account
     *
     * Confirms a new user account creating a new random pass for it
     * and sending it by email.
     *
     * NOTE: E-mail sending is not yet working
     */
    router.get("/confirm/:email", function(req, res){

        var randomPass = randomstring.generate(8);
        var hashPass = require('crypto')
            .createHash('sha1')
            .update(randomPass)
            .digest('base64');
        console.log("RandomPass: "+randomPass);
        console.log(req.params.email);
        User.findOneAndUpdate({email: req.params.email}, {password: hashPass}, function(err, result){
            if(err){
                res.status(500).send("Error borrando usuario");
                return;
            }
            if(result===null){
                res.status(404).send("El usuario no existe");
            }
            else{
                var message = "Confirmación completada. Comprueba tu correo para iniciar sesión con tu contraseña.";
                var mailOptions = {
                    from: 'No-Reply <verif.anisclo@gmail.com>',
                    to: req.params.email,
                    subject: 'Pirineo\'s POI account password',
                    html: 'Hello there!</p>' +
                    '<p>This is your password for your Pirineo\'s POI account:</p>' +
                    '<p>'+randomPass+'</p>'+
                    '<p>For your own security, you will be forced to change it after your first login.</p>'+
                    '<p>The Pirineo\'s POI team.</p>'
                };
                sendEmail(mailOptions, res, message);
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

    /*
     * Get user info.
     *
     * Returns the profile of the user with email [email]
     */
    router.get("/:email", function(req,res){
        User.findOne({email: req.params.email},function(err,data){
            if(err) {
                res.status(500).send("Error recuperando datos");
                return;
            }

            if(data){
                res.status(200).send(data);
            }
            else {
                res.status(404).send("El usuario no existe");
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
     * Change password
     *
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

            if(result && hashPass===result.password){

                var hashPass = require('crypto')
                    .createHash('sha1')
                    .update(req.body.new)
                    .digest('base64');

                User.update({email: req.params.email}, {password:hashPass, firstLogin: false},function(err,data){

                    if(err) {
                        res.status(500).send("Error actualizando usuario");
                        return;
                    }

                    res.status(200).send("Usuario actualizado correctamente");

                });
            }
            else{
                res.status(404).send("Contraseña actual incorrecta");
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
     * Delete user
     *
     * Removes the user with the corresponding email from the system
     */
    router.delete("/:email", function(req,res){
        console.log("Email: "+req.params.email);

        if(!req.body.current){
            res.status(404).send("Contraseña incorrecta");
            return;
        }

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

    /**
     * Sets up the SMTP server and sends an email
     * with [mailOptions].
     */
    function sendEmail(mailOptions, res, message){

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
                res.status(200).send(message);
            }
        });

    }

    return router;
};
