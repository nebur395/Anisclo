var express = require('express');
var async = require("async");

module.exports = function (app) {

    var router = express.Router();

    var User = app.models.User;
    var POI = app.models.POI;

    /**
     * @swagger
     * /admin/users/:
     *   get:
     *     tags:
     *       - Admin
     *     summary: Listar todos los usuarios del sistema
     *     description: Lista todos los usuarios del sistema con información a la que sólo
     *      el admin puede acceder, a excepción de los usuarios administradores, que no los devuelve.
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
     *     responses:
     *       200:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           type: object
     *           properties:
     *              users:
     *                type: array
     *                items:
     *                   $ref: '#/definitions/UserForAdmin'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/users", function(req, res){

        if (!req.user.admin) {
            res.status(401).send({
                "success": false,
                "message": "No estás autorizado a acceder."
            });
            return;
        }

        User.find({admin: false}, function(err, result){

            if (err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            var users = [];
            async.each(result, function(user, callback){

                var ban = -1;
                // Checks if the user's account have any kind of ban, temporary or permanent
                if(user.banInitDate !== null && user.banFinishDate !== null){
                    var initDate = new Date(user.banInitDate);
                    var finishDate = new Date(user.banFinishDate);
                    ban = parseInt((finishDate.valueOf() - initDate.valueOf())/(1000*60*60*24));

                }
                else if (user.banInitDate !== null){ ban=0; }

                var userInfo = {

                    "email":user.email,
                    "name":user.name,
                    "lastname":user.lastname,
                    "admin":user.admin,
                    "firstLogin":user.firstLogin,
                    "favs":user.favs,
                    "follows":user.follows,
                    "isActive":user.isActive,
                    "ban": ban
                };
                users.push(userInfo);
                callback();

            }, function(err){

                if (err){
                    res.status(500).send({
                        "success": false,
                        "message": "Error creando respuesta"
                    });
                    return;
                }

                res.status(200).send({
                    "users": users
                });
            });
        });

    });


    /**
     * @swagger
     * /admin/users/{email}:
     *   put:
     *     tags:
     *       - Admin
     *     summary: Modifica la información de un usuario
     *     description: Permite a un administrador modificar una información
     *      determinada del usuario en concreto.
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
     *       - name: Json
     *         description: Booleano que indica si la información llega en XLM o JSON. True = JSON.
     *         in: header
     *         required: true
     *         type: boolean
     *       - name: email
     *         description: Email del usuario que sirve como identificador.
     *         in: path
     *         required: true
     *         type: string
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
     *       - name: newEmail
     *         description: Nuevo email del usuario.
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
    router.put("/users/:email", function(req, res){

        if (!req.user.admin) {
            res.status(401).send({
                "success": false,
                "message": "No estás autorizado a acceder."
            });
            return;
        }

        // Checks if the JSON header exists
        if(!req.headers["json"]){
            res.status(404).send({
                "success": false,
                "message": "El campo 'Json' de las cabeceras no existe o no es válido."
            });
            return;
        }

        var name, lastname, newEmail;

        // Checks if the body is comming on JSON or XML
        if(req.headers['json'] === 'true'){
            name = req.body.name;
            lastname = req.body.lastname;
            newEmail = req.body.newEmail;
        }
        else{
            // Since the body-parser-xml already transfroms the xml into an js object, it only extracts the fields
            name = req.body.newUser.name;
            lastname = req.body.newUser.lastname;
            newEmail = req.body.newUser.newEmail;
        }

        // Checks all body fields
        if(!name || !lastname || !newEmail){
            res.status(404).send({
                "success": false,
                "message": "Nombre, apellido o nuevo email incorrectos"
            });
            return;
        }

        User.findOneAndUpdate({email: req.params.email}, {name: name,
            lastname: lastname, email: newEmail}, function(err, result){

            if (err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando y actualizando datos"
                });
                return;
            }

            if(result !== null){
                res.status(200).send({
                    "success": true,
                    "message": "Usuario actualizado correctamente"
                });
            }
            else{
                res.status(404).send({
                    "success": false,
                    "message": "El usuario no existe"
                });
            }

        });
    });


    /**
     * @swagger
     * /admin/users/{email}/ban:
     *   put:
     *     tags:
     *       - Admin
     *     summary: Banea al usuario
     *     description: Permite a un administrador banear a un
     *      usuario de forma permanente o temporal.
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
     *       - name: time
     *         description: Número de días que estará baneado el usuaro. 0 implica baneo permanente.
     *         in: body
     *         required: true
     *         type: number
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
    router.put("/users/:email/ban", function(req, res){

        if (!req.user.admin) {
            res.status(401).send({
                "success": false,
                "message": "No estás autorizado a acceder."
            });
            return;
        }

        // Checks all body fields
        if(!req.body.time && req.body.time<0){
            res.status(404).send({
                "success": false,
                "message": "Tiempo de baneo incorrecto"
            });
            return;
        }

        var banInitDate = new Date();
        var banFinishDate = null;
        if(req.body.time !== 0){
            banFinishDate = new Date((req.body.time*(1000*60*60*24)) + banInitDate.valueOf());
        }

        User.findOneAndUpdate({email: req.params.email}, {banInitDate: banInitDate, banFinishDate: banFinishDate},
            function(err, result){

                if (err){
                    res.status(500).send({
                        "success": false,
                        "message": "Error recuperando y actualizando datos"
                    });
                    return;
                }

                if(result !== null){
                    res.status(200).send({
                        "success": true,
                        "message": "Usuario baneado correctamente"
                    });
                }
                else{
                    res.status(404).send({
                        "success": false,
                        "message": "El usuario no existe"
                    });
                }
        });
    });

    /**
     * @swagger
     * /admin/users/{email}/unban:
     *   put:
     *     tags:
     *       - Admin
     *     summary: Desbanea al usuario
     *     description: Permite a un administrador desbanear a un
     *      usuario.
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
    router.put("/users/:email/unban", function(req, res){

        if (!req.user.admin) {
            res.status(401).send({
                "success": false,
                "message": "No estás autorizado a acceder."
            });
            return;
        }

        User.findOneAndUpdate({email: req.params.email}, {banInitDate:null, banFinishDate: null}, function(err, result){

            if (err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando y actualizando datos"
                });
                return;
            }

            if(result !== null){
                res.status(200).send({
                    "success": true,
                    "message": "Usuario desbaneado correctamente"
                });
            }
            else{
                res.status(404).send({
                    "success": false,
                    "message": "El usuario no existe"
                });
            }
        });
    });


    /**
     * @swagger
     * /admin/users/{email}/useDragonBalls:
     *   put:
     *     tags:
     *       - Admin
     *     summary: Reactiva una cuenta de usuario.
     *     description: Permite a un administrador emplear sus todopoderosas
     *      bolas de dragón para reactivar una cuenta de usuario que éste
     *      había borrado.
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
    router.put("/users/:email/useDragonBalls", function(req, res){

        if (!req.user.admin) {
            res.status(401).send({
                "success": false,
                "message": "No estás autorizado a acceder."
            });
            return;
        }

        User.findOneAndUpdate({email: req.params.email}, {isActive: true, deactivationDate: null}, function(err, result){

            if (err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando y actualizando datos"
                });
                return;
            }

            if(result !== null){
                res.status(200).send({
                    "success": true,
                    "message": "Cuenta de usuario reactivada correctamente"
                });
            }
            else{
                res.status(404).send({
                    "success": false,
                    "message": "El usuario no existe"
                });
            }
        });

    });

    return router;
};
