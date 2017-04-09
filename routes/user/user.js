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
     * /users/:
     *   post:
     *     tags:
     *       - Users
     *     summary: Crear usuario (Sign Up)
     *     description: Crea un nuevo usuario en el sistema, comprueba que no se trate de un bot
     *       con el recaptcha de google y manda un correo electrónico al parámetro [email] con un
     *       link para confirmar la creación de la cuenta.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: name
     *         description: Nombre del usuario.
     *         in: body
     *         required: true
     *         type: string
     *       - name: lastname
     *         description: Apellido del usuario.
     *         in: body
     *         required: true
     *         type: string
     *       - name: email
     *         description: Email del usuario que sirve como identificador.
     *         in: body
     *         required: true
     *         type: string
     *       - name: captcha
     *         description: Key del recaptcha de google.
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Mensaje de feedback para el usuario.
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *       500:
     *         description: Mensaje de feedback para el usuario.
     */
	router.post("/", function(req,res){

        // Checks all body fields
        if(!req.body.name || !req.body.lastname || !req.body.email){
            res.status(404).send("Nombre, apellido o email incorrectos");
            return;
        }

        /*
        request.post({url:'https://www.google.com/recaptcha/api/siteverify',
                form: {secret:'<PRIVATE KEY>', response:req.body.captcha}},
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(body)
                    }
                }
        );
        */

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
     * @swagger
     * /users/login:
     *   get:
     *     tags:
     *       - Users
     *     summary: Iniciar sesión
     *     description: End-point para iniciar sesión en el sistema. El usuario pasa los
     *       credenciales de la cuenta siguiendo el estándar de base64.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: Authorization
     *         description: |
     *           Base64 estándar: `Authorization: Basic + base64.encode(user:password)`.
     *         in: header
     *         required: true
     *         type: string
     *         format: byte
     *     responses:
     *       200:
     *         description: Información de perfil del usuario.
     *         schema:
     *           $ref: '#/definitions/User'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *       500:
     *         description: Mensaje de feedback para el usuario.
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
     * @swagger
     * /users/retrievePass:
     *   put:
     *     tags:
     *       - Users
     *     summary: Recuperar contraseña
     *     description: Genera una nueva contraseña aleatoria para el usuario y la manda por
     *       correo electrónico para que el usuario pueda acceder al sistema si se ha olvidado de
     *       su contraseña anterior.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: email
     *         description: Email del usuario que sirve como identificador.
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Mensaje de feedback para el usuario.
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *       500:
     *         description: Mensaje de feedback para el usuario.
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
     * @swagger
     * /users/confirm/{email}:
     *   get:
     *     tags:
     *       - Users
     *     summary: Confirmar contraseña
     *     description: Confirma la cuenta de un usuario creando una nueva contraseña aleatoria
     *       y pasándosela al usuario por correo electrónico.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: email
     *         description: Email del usuario que sirve como identificador.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Mensaje de feedback para el usuario.
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *       500:
     *         description: Mensaje de feedback para el usuario.
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
     * /users/{email}:
     *   get:
     *     tags:
     *       - Users
     *     summary: Buscar usuario
     *     description: Busca un usuario por el email en el sistema y devuelve su información de
     *       perfil.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: email
     *         description: Email del usuario que sirve como identificador.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Información de perfil del usuario.
     *         schema:
     *           $ref: '#/definitions/User'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *       500:
     *         description: Mensaje de feedback para el usuario.
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
     * /users/{email}:
     *   put:
     *     tags:
     *       - Users
     *     summary: Cambiar contraseña
     *     description: Cambia la contraseña de un usuario determinado.
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: email
     *         description: Email del usuario que sirve como identificador.
     *         in: path
     *         required: true
     *         type: string
     *       - name: current
     *         description: Contraseña actual del usuario.
     *         in: body
     *         required: true
     *         type: string
     *       - name: new
     *         description: Contraseña nueva del usuario.
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Mensaje de feedback para el usuario.
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *       500:
     *         description: Mensaje de feedback para el usuario.
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

                hashPass = require('crypto')
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
                res.status(404).send("Email o contraseña actual incorrectos");
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
