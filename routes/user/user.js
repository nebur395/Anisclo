var http = require("http");
var express = require('express');
var base64 = require('base-64');
var utf8 = require('utf8');
var randomstring = require('randomstring');
var nodemailer = require('nodemailer');
var ip = require('ip');
var request = require('request');
var jwt = require ('jsonwebtoken');


module.exports = function (app) {

    /**
     * @swagger
     * definition:
     *   FeedbackMessage:
     *     description: Mensaje de feedback que se devuelve al usuario en caso de error o acierto en una determinada
     *       operación.
     *     type: object
     *     properties:
     *       success:
     *         type: boolean
     *         required: true
     *         description: True si la operación ha ido con éxito. False si ha habido algún error.
     *       message:
     *         type: string
     *         required: true
     *         description: Mensaje que describe el resultado de una operación.
     */

	var router = express.Router();

    var User = app.models.User;
    var POI = app.models.POI;

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
     *     consumes:
     *       - application/json
     *       - charset=utf-8
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
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
	router.post("/", function(req,res){

        // Checks all body fields
        if(!req.body.name || !req.body.lastname || !req.body.email){
            res.status(404).send({
                "success": false,
                "message": "Nombre, apellido o email incorrectos"
            });
            return;
        }

        ////////////////////////////////////////////////////////////
        // Esta sección comentada pertenece al captcha de Google.//
        // Se encuentra comentada para evitar problemas con la ///
        // ejecución de los tests.                           ////
        ////////////////////////////////////////////////////////

        /*request.post({url:'https://www.google.com/recaptcha/api/siteverify',
                form: {secret:'<PRIVATE KEY>', response:req.body.captcha}},
                function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(body)
                    }
                }
        );*/


        User.findOne({email: req.body.email}, function(err, result){

            if(err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
            }

            if(result){
                res.status(404).send({
                    "success": false,
                    "message": "Ya existe una cuenta con ese correo."
                });
            }
            else{
                console.log("Nombre: "+req.body.name+" Apellido: "+req.body.lastname+" Email: "+req.body.email);
                User.create({

                    email: req.body.email,
                    name: req.body.name,
                    lastname: req.body.lastname,
                    firstLogin: true,
                    admin: false

                }, function (err, result){

                    if(err){
                        res.status(500).send({
                            "success": false,
                            "message": "Error guardando datos"
                        });
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
            }
        });
    });

    /**
     * @swagger
     * /users/google:
     *   post:
     *     tags:
     *       - Users
     *     summary: Crear usuario con cuenta de Google
     *     description: Crea un nuevo usuario en el sistema usando los datos de su cuenta de google
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: code
     *         description: Codigo para pedir datos a google
     *         in: body
     *         required: true
     *         type: string
     *       - name: clientId
     *         description: API key publico de nuestra app
     *         required: true
     *         type: string
     *       - name: redirectUri
     *         description: Direccion de enrutamiento para la peticion a google (predefinido)
     *     responses:
     *       200:
     *         description: Informacion de perfil de usuario.
     *         schema:
     *           $ref: '#/definitions/User'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.post("/google", function(req,res){
        var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
        var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
        var params = {
            code: req.body.code,
            client_id: req.body.clientId,
            client_secret: 'GOOGLE API KEY HERE',
            redirect_uri: req.body.redirectUri,
            grant_type: 'authorization_code'
        };
        // Step 1: Exchange auth code for access token
        request.post(accessTokenUrl, {json: true, form:params},function (err,response,token) {
            var accessToken = token.access_token;
            var headers = {Authorization: 'Bearer ' + accessToken};
            //Step 2: Retrieve profile information about the current user
            request.get({url: peopleApiUrl, headers: headers, json:true}, function(err, response, profile){
                if(profile.error){
                    res.status(500).send({ // something got fucked up
                        "success": false,
                        "message": "Error al pedir profile " +profile.error.message
                    });
                }
                else{
                    console.log("Nombre: "+profile.given_name+" Apellido: "+profile.family_name+" Email: "+profile.email);
                    // Check if user exists
                    User.findOneAndUpdate({email: profile.email}, {lastLoginDate: Date.now()}, function(err, result){

                        if (result === null){ // User doesn't exist, so it's a signUp!
                            User.create({
                                email: profile.email,
                                name: profile.given_name,
                                lastname: profile.family_name,
                                google: profile.sub,
                                firstLogin: false,
                                admin: false
                            }, function (err, result){
                                if(err){
                                    res.status(500).send({ // something got fucked up
                                        "success": false,
                                        "message": "Error guardando datos"
                                    });
                                }
                                else{ //all good, proceed to login
                                    res.status(200).send({
                                        "email": result.email,
                                        "name": result.name,
                                        "lastname": result.lastname,
                                        "firstLogin": result.firstLogin,
                                        "admin": result.admin,
                                        "favs": result.favs,
                                        "follows": result.follows,
                                        "google": result.google
                                    });
                                }
                            });
                        }
                        // If there's a user with that email and the token is correct
                        else if(result && result.google === profile.sub){

                            // Checks if the user's account is active
                            if(!result.isActive){
                                res.status(404).send({
                                    "success": false,
                                    "message": "La cuenta no está activa. Contacte con el administrador."
                                });
                                return;
                            }

                            // Checks if the user's account have any kind of ban, temporary or permanent
                            if(result.banInitDate !== null && result.banFinishDate !== null){
                                var initDate = new Date(result.banInitDate);
                                var finishDate = new Date(result.banFinishDate);
                                var remainingTime = parseInt((finishDate.valueOf() - initDate.valueOf())/(1000*60*60*24));
                                res.status(404).send({
                                    "success": false,
                                    "message": "Su cuenta se encuentra baneada temporalmente. Podrá volver en "+remainingTime+" días."
                                });
                                return;

                            }
                            else if (result.banInitDate !== null){
                                res.status(404).send({
                                    "success": false,
                                    "message": "Su cuenta se encuentra baneada permanentemente."
                                });
                                return;
                            }

                            res.status(200).send({
                                "email": result.email,
                                "name": result.name,
                                "lastname": result.lastname,
                                "firstLogin": result.firstLogin,
                                "admin": result.admin,
                                "favs": result.favs,
                                "follows": result.follows,
                                "google": result.google
                            });
                        }
                        // If there's no user with that token then it's not a google account
                        else{
                            res.status(404).send({
                                "success": false,
                                "message": "Error al intentar iniciar sesión"
                            });
                        }
                    });
                }
            })
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
     *     consumes:
     *       - application/json
     *       - charset=utf-8
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
     *         description: Información de perfil del usuario metido dentro de un JSON Web Token.
     *         schema:
     *           type: object
     *           properties:
     *             token:
     *               $ref: '#/definitions/User'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
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
        User.findOneAndUpdate({email: email}, {lastLoginDate: Date.now()}, function(err, result){

            if (err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos."
                });
                return;
            }

            // Hashes the password in order to compare it with the stored one
            var hashPass = require('crypto')
                .createHash('sha1')
                .update(pass)
                .digest('base64');

            // If there's a user with that email
            if(result!==null){

                // Checks if the user's account is active
                if(!result.isActive){
                    res.status(404).send({
                        "success": false,
                        "message": "La cuenta no está activa. Contacte con el administrador."
                    });
                    return;
                }

                // Checks if the user's account have any kind of ban, temporary or permanent
                if(result.banInitDate !== null && result.banFinishDate !== null){
                    var initDate = new Date(result.banInitDate);
                    var finishDate = new Date(result.banFinishDate);
                    var remainingTime = parseInt((finishDate.valueOf() - initDate.valueOf())/(1000*60*60*24));
                    res.status(404).send({
                        "success": false,
                        "message": "Su cuenta se encuentra baneada temporalmente. Podrá volver en "+remainingTime+" días."
                    });
                    return;

                }
                else if (result.banInitDate !== null){
                    res.status(404).send({
                        "success": false,
                        "message": "Su cuenta se encuentra baneada permanentemente."
                    });
                    return;
                }

                // If the account is active and have no ban on it, checks if the password is correct
                if(hashPass!==result.password){
                    res.status(404).send({
                        "success": false,
                        "message": "Email o contraseña incorrectos"
                    });
                    return;
                }

                // User to be sent in the response
                var userResponse = {
                    "email": result.email,
                    "name": result.name,
                    "lastname": result.lastname,
                    "firstLogin": result.firstLogin,
                    "admin": result.admin,
                    "favs": result.favs,
                    "follows": result.follows
                };

                // If user is found and password is right, create and sign a jwt for it
                var token = jwt.sign(userResponse, app.get('secret'), {
                    expiresIn: "1h" // expires in 1 hours
                });

                res.status(200).send({
                        "token": token
                });
            }
            // If there's no user with that email or the password is incorrect
            else{
                res.status(404).send({
                    "success": false,
                    "message": "Email o contraseña incorrectos"
                });
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
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
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
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.put("/retrievePass", function(req, res){

        ////////////////////////////////////////////////////////////
        // Esta sección comentada pertenece al captcha de Google.//
        // Se encuentra comentada para evitar problemas con la ///
        // ejecución de los tests.                           ////
        ////////////////////////////////////////////////////////

        /*request.post({url:'https://www.google.com/recaptcha/api/siteverify',
                form: {secret:'<PRIVATE KEY>', response:req.body.captcha}},
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log(body)
                }
            }
        );*/

        var randomPass = randomstring.generate(8);
        var hashPass = require('crypto')
            .createHash('sha1')
            .update(randomPass)
            .digest('base64');

        User.findOneAndUpdate({email: req.body.email}, {password: hashPass, firstLogin: true}, function(err, result){
            if(err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando y actualizando datos"
                });
                return;
            }
            if(result===null){
                res.status(404).send({
                    "success": false,
                    "message": "El usuario no existe"
                });
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
     *     consumes:
     *       - application/json
     *       - charset=utf-8
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
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
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
                res.status(500).send({
                    "success": false,
                    "message": "Error borrando usuario"
                });
                return;
            }
            if(result===null){
                res.status(404).send({
                    "success": false,
                    "message": "El usuario no existe"
                });
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
     * /users/{email}/fav:
     *   put:
     *     tags:
     *       - Users
     *     summary: Añadir POI a favoritos
     *     description: Añade el POI indicado a la lista de POIs favoritos
     *      del usuario.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: Authorization
     *         description: |
     *           JWT estándar: `Authorization: Bearer + JWT`.
     *         in: header
     *         required: true
     *         type: string
     *         format: byte
     *       - name: email
     *         description: Email del usuario que sirve como identificador.
     *         in: path
     *         required: true
     *         type: string
     *       - name: poiId
     *         description: ID del POI que se desea añadir como favorito.
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.put("/:email/fav", function(req, res){

        // Checks all body fields
        if(!req.body.poiId){
            res.status(404).send({
                "success": false,
                "message": "ID del POI no válido."
            });
            return;
        }

        // Checks if the users exists.
        User.findOne({"email":req.params.email}, function(err, user){

            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos."
                });
                return;
            }

            // If the user exists
            if(user){

                var isFav = user.favs.indexOf(req.body.poiId);
                var favIncrement = isFav===-1 ? 1 : -1;

                // Checks if the given POI exists
                POI.findByIdAndUpdate(req.body.poiId, {$inc: {"favNumber":favIncrement}}, function(err, poi){

                    if(err) {
                        res.status(500).send({
                            "success": false,
                            "message": "Error recuperando datos."
                        });
                        return;
                    }

                    // If the POI exists
                    if(poi!==null){

                        var message = '';
                        // Checks if the user already has that POI as fav

                        // If the user doesn't have that POI as fav, it adds it to the favs list
                        if(isFav == -1){
                            user.favs.push(req.body.poiId);
                            message = "añadido a";
                        }
                        // If the user has that POI as fav, it removes it from the favs list
                        else{
                            user.favs.splice(isFav, 1);
                            message = "eliminado de";
                        }
                        // Saves the user with the new list of fav POIs
                        user.save(function(err, result){
                            if(err) {
                                res.status(500).send({
                                    "success": false,
                                    "message": "Error guardando datos."
                                });
                            }
                            else{
                                res.status(200).send({
                                    "success": true,
                                    "message": "POI "+message+" favoritos."
                                });
                            }
                        });
                    }

                    // If the POI doesn't exist
                    else{
                        res.status(404).send({
                            "success": false,
                            "message": "El POI no existe."
                        });
                    }
                });
            }
            // If the user doesn't exist
            else{
                res.status(404).send({
                    "success": false,
                    "message": "El usuario no existe."
                });
            }
        });
    });

    /**
     * @swagger
     * /users/{email}/follow:
     *   put:
     *     tags:
     *       - Users
     *     summary: Seguir a un usuario
     *     description: Añade un nuevo usuario a la lista de usuarios
     *      a los que sigue.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: Authorization
     *         description: |
     *           JWT estándar: `Authorization: Bearer + JWT`.
     *         in: header
     *         required: true
     *         type: string
     *         format: byte
     *       - name: email
     *         description: Email del usuario que sirve como identificador.
     *         in: path
     *         required: true
     *         type: string
     *       - name: userToFollowEmail
     *         description: Email del usuario al que se va a seguir que sirve como identificador.
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.put("/:email/follow", function(req, res){

        // Checks all body fields
        if(!req.body.userToFollowEmail){
            res.status(404).send({
                "success": false,
                "message": "El email del usuario al que desea seguir no es válido"
            });
            return;
        }

        // Checks if the user exists
        User.findOne({"email":req.params.email}, function(err, user){

            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos."
                });
                return;
            }

            // If the user exists
            if(user){

                // Checks if the user to be followed exists
                User.findOne({"email":req.body.userToFollowEmail}, function(err, userToFollow){

                    if(err) {
                        res.status(500).send({
                            "success": false,
                            "message": "Error recuperando datos."
                        });
                        return;
                    }

                    // If the user to be followed exists
                    if(userToFollow){

                        var message = '';
                        // Checks if the user is already following the other user
                        var following = user.follows.indexOf(req.body.userToFollowEmail);
                        // If it's not already following the user
                        if(following == -1){
                            // Adds the user to the following list and saves it
                            user.follows.push(req.body.userToFollowEmail);
                            message = "añadido a";
                        }
                        // If the user is already on the following list
                        else{
                            user.follows.splice(following, 1);
                            message = "eliminado de";
                        }
                        user.save(function(err, result){

                            if(err) {
                                res.status(500).send({
                                    "success": false,
                                    "message": "Error guardando datos."
                                });
                            }
                            else{
                                res.status(200).send({
                                    "success": true,
                                    "message": "Usuario "+message+" la lista de seguimientos"
                                });
                            }
                        });
                    }
                    // If the user to be followed doesn't exist
                    else{
                        res.status(404).send({
                            "success": false,
                            "message": "El usuario al que desea seguir no existe."
                        });
                    }
                });

            }
            // If the user doesn't exist
            else{
                res.status(404).send({
                    "success": false,
                    "message": "El usuario no existe."
                });
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
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: Authorization
     *         description: |
     *           JWT estándar: `Authorization: Bearer + JWT`.
     *         in: header
     *         required: true
     *         type: string
     *         format: byte
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
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.put("/:email", function(req,res){

        if(!req.body.current || !req.body.new){
            res.status(404).send({
                "success": false,
                "message": "Contraseña incorrecta"
            });
            return;
        }
        User.findOne({email: req.params.email}, function(err, result){

            if (err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
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
                        res.status(500).send({
                            "succes": false,
                            "message": "Error actualizando datos"
                        });
                        return;
                    }

                    res.status(200).send({
                        "success": true,
                        "message": "Usuario actualizado correctamente"
                    });

                });
            }
            else{
                res.status(404).send({
                    "success": false,
                    "message": "Email o contraseña actual incorrectos"
                });
            }
        });
    });

    /**
     * @swagger
     * /users/{email}:
     *   delete:
     *     tags:
     *       - Users
     *     summary: Borrar usuario
     *     description: Borra la cuenta de usuario.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: Authorization
     *         description: |
     *           JWT estándar: `Authorization: Bearer + JWT`.
     *         in: header
     *         required: true
     *         type: string
     *         format: byte
     *       - name: email
     *         description: Email del usuario que sirve como identificador.
     *         in: path
     *         required: true
     *         type: string
     *       - name: current
     *         description: Contraseña actual del usuario.
     *         in: body
     *         required: false
     *         type: string
     *       - name: google
     *         description: Booleano que indica si es cuenta de google
     *         in: body
     *         required: false
     *         type: string
     *     responses:
     *       200:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.delete("/:email", function(req,res){
        console.log("Email: "+req.params.email);

        if(!req.body.google && !req.body.current){
            res.status(404).send({
                "success": false,
                "message": "Contraseña incorrecta"
            });
            return;
        }

        User.findOne({email: req.params.email}, function(err, result){

            if (err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }
			
            if(result && req.body.google){ //If it's a google user, no need to check password
                User.update({email: req.params.email}, {isActive: false}, function(err,result){
                    if(err) {
                        res.status(500).send({
                            "success": false,
                            "message": "Error borrando usuario"
                        });
                        return;
                    }

                    res.status(200).send({
                        "success": true,
                        "message": "Usuario eliminado correctamente"
                    });
                });
            }
            else if(result && req.body.current){
                // Hashes the password in order to compare it with the stored one
                var hashPass = require('crypto')
                    .createHash('sha1')
                    .update(req.body.current)
                    .digest('base64');

                // If the user exists and the password is correct
                if(result && hashPass===result.password){

                    User.update({email: req.params.email}, {isActive: false, deactivationDate: new Date()}, function(err,result){

                        if(err) {
                            res.status(500).send({
                                "success": false,
                                "message": "Error borrando usuario"
                            });
                            return;
                        }

                        res.status(200).send({
                            "success": true,
                            "message": "Usuario eliminado correctamente"
                        });
                    });
                }
                // If the user doesn't exist or the password is incorrect
                else{
                    res.status(404).send({
                        "success": false,
                        "message": "Email o contraseña incorrectos"
                    });
                }
            }
            else{ //No result
                res.status(404).send({
                    "success": false,
                    "message": "Email o contraseña incorrectos"
                });
            }
        });

    });

    /**
     * @swagger
     * /users/{email}:
     *   get:
     *     tags:
     *       - Users
     *     summary: Pedir usuario de google
     *     description: Devuelve la cuenta de usuario registrado con google.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: Authorization
     *         description: |
     *           JWT estándar: `Authorization: Bearer + JWT`.
     *         in: header
     *         required: true
     *         type: string
     *         format: byte
     *       - name: email
     *         description: Email del usuario que sirve como identificador.
     *         in: path
     *         required: true
     *         type: string
     *       - name: token
     *         description: Token identificador de google
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/:email", function(req,res){
        console.log("Email: "+req.params.email);

        User.findOne({email: req.params.email}, function(err, result){
            if (err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }
            if(result === null){
                res.status(404).send({
                    "success": false,
                    "message": "El usuario no existe"
                });
            }
            else if(req.headers.token === result.google){

                var preToken = {
                    "email": result.email,
                    "name": result.name,
                    "lastname": result.lastname,
                    "firstLogin": result.firstLogin,
                    "admin": result.admin,
                    "favs": result.favs,
                    "follows": result.follows,
                    "google": true
                };
                var token = jwt.sign(preToken,app.get('secret'), {
                    expiresIn: '1h'
                });
                res.status(200).send({
                    "token": token
                });
            }
            // If the user doesn't exist or the token is incorrect
            else{
                res.status(404).send({
                    "success": false,
                    "message": "Email o contraseña incorrectos"
                });
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
                res.status(200).send({
                    "success": true,
                    "message": message
                });
            }
        });

    }

    return router;
};
