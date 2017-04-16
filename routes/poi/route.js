var express = require('express');
var async = require("async");
var ip = require('ip');
var nodemailer = require('nodemailer');

module.exports = function (app) {

    var router = express.Router();
    var User = app.models.User;
    var POI = app.models.POI;
    var Route = app.models.Route;

    /**
     * @swagger
     * /routes/:
     *   post:
     *     tags:
     *       - Routes
     *     summary: Guardar una ruta
     *     description: Se guarda una nueva ruta creada por un usuario junto con toda la
     *       información relevante que se considere guardar con fines estadísticos.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userEmail
     *         description: Email del usuario creador de la ruta.
     *         in: body
     *         required: true
     *         type: string
     *       - name: travelMode
     *         description: |
     *           Modo de transporte de la ruta. Valor discreto entre: 'DRIVING' OR 'WALKING' OR 'BICYCLING' OR 'TRANSIT'
     *         in: body
     *         required: true
     *         type: string
     *       - name: routePOIs
     *         description: Lista de los IDs de los POIs que componen la ruta para poder reproducirla.
     *         in: body
     *         required: true
     *         type: array
     *         items:
     *           type: string
     *       - name: routeInfo
     *         description: Una lista que contiene información asociada a la ruta. Por cada
     *           tramo de la misma, su duración y distancia.
     *         in: body
     *         required: true
     *         type: array
     *         items:
     *           type: object
     *           properties:
     *             distance:
     *               type: object
     *               description: Contiene la información del tramo de la ruta referente a la
     *                 distancia.
     *               properties:
     *                 text:
     *                   type: string
     *                   description: Información en forma de string de la distancia (p.e., "128 km")
     *                 value:
     *                   type: number
     *                   description: Valor de la distancia en metros (p.e., 128123)
     *             duration:
     *               type: object
     *               description: Contiene la información del tramo de la ruta referente a la
     *                 duración.
     *               properties:
     *                 text:
     *                   type: string
     *                   description: Información en forma de string de la duración (p.e., "1 hour 28mins")
     *                 value:
     *                   type: number
     *                   description: Valor de la duración en segundos (p.e., 5275)
     *
     *     responses:
     *       200:
     *         description: ID de la ruta creada.
     *         type: object
     *         properties:
     *           routeID:
     *             type: string
     *             description: ID de la ruta guardada en el sistema para poder reproducirla
     *               posteriormente.
     *       404:
     *         description: Mensaje de feecback para el usuario.
     *         schema:
     *              $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feecback para el usuario.
     *         schema:
     *              $ref: '#/definitions/FeedbackMessage'
     */
    router.post("/", function(req, res){

        // Checks all body fields
        if(!req.body.userEmail || !req.body.travelMode || !req.body.routePOIs || !req.body.routeInfo){
            res.status(404).send({
                "success": false,
                "message": "Usuario, modo de viaje, POIs o información de la ruta no válidos"
            });
            return;
        }

        // Checks the travel mode of the route is within the supported modes
        if(!req.body.travelMode==="DRIVING" || !req.body.travelMode==="WALKING" ||
            !req.body.travelMode==="BICYCLING" || !req.body.travelMode==="TRANSIT"){
            res.status(404).send({
                "success": false,
                "message": "Modo de viaje incorrecto"
            });
            return;
        }

        // Checks if the user that is creating the route exists
        User.findOne({"email":req.body.userEmail}, function(err, user){

            if (err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            // If the user exists
            if(user){

                // Checks if all the POIs within the route exist
                async.each(req.body.routePOIs, function(poiId, callback){

                    POI.findById(poiId, function(err, poi){

                        if (err){
                            res.status(500).send({
                                "success": false,
                                "message": "Error recuperando datos"
                            });
                            return;
                        }

                        // If the POI exists, it continues to check the rest
                        if(poi){
                            callback();
                        }
                        // If the POI doesn't exist, an error is thrown.
                        else{
                            var error = "El POI '"+poiId+"' no existe";
                            callback(error);
                        }
                    });

                }, function(err){
                    if (err){
                        res.status(404).send({
                            "success": false,
                            "message": err
                        });
                        return;
                    }

                    // If all the POIs exist, the new route is created and saved
                    Route.create({

                        owner: req.body.userEmail,
                        travelMode: req.body.travelMode,
                        routePOIs: req.body.routePOIs,
                        routeInfo: req.body.routeInfo

                    }, function(err, result){

                        if (err){
                            res.status(500).send({
                                "success": false,
                                "message": "Error guardando datos"
                            });
                            return;
                        }

                        res.status(200).send({
                            "routeID": result._id
                        });
                    });

                });

            }
            // If the user doesn't exist
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
     * /routes/{id}/sendRoute/:
     *   post:
     *     tags:
     *       - Routes
     *     summary: Enviar email con un ruta
     *     description: Envía un email a la dirección indicada con
     *      el ID de una ruta para poder introducirla y mostrarla
     *      en la app.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: Id de la ruta.
     *         in: path
     *         required: true
     *         type: string
     *       - name: ownerEmail
     *         description: Email del usuario que envía la ruta (y que la ha creado).
     *         in: body
     *         required: true
     *         type: string
     *       - name: receiverEmail
     *         description: Email del usuario al que se le envía la ruta.
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Mensaje de feecback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       404:
     *         description: Mensaje de feecback para el usuario.
     *         schema:
     *              $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feecback para el usuario.
     *         schema:
     *              $ref: '#/definitions/FeedbackMessage'
     */
    router.post("/:id/sendRoute", function(req, res){

        // Checks all body fields
        if(!req.body.ownerEmail || !req.body.receiverEmail){
            res.status(404).send({
                "success": false,
                "message": "Uno o los dos emails no son válidos"
            });
            return;
        }

        User.findOne({"email":req.body.ownerEmail}, function(err, owner){

            if (err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            if(owner){

                Route.findOne({"_id":req.params.id, "owner":req.body.ownerEmail}, function(err, route){

                    if (err){
                        res.status(500).send({
                            "success": false,
                            "message": "Error recuperando datos"
                        });
                        return;
                    }

                    if(route){
                        var ipAddr = ip.address();
                        var urlLogin = "http://"+ipAddr+":8080";
                        var urlSignUp = "http://"+ipAddr+":8080/#/signUp";
                        var mailOptions = {
                            from: 'No-Reply <verif.anisclo@gmail.com>',
                            to: req.body.receiverEmail,
                            subject: '[Pirineo\'s POI] Someone has sent you a route!',
                            html: 'Hello there!</p>' +
                            '<p>The user '+req.body.ownerEmail+' has sent you a route!</p>' +
                            '<p>Check it out <a href='+urlLogin+' target="_blank">here</a> using the following code to create the route!</p>' +
                            '<p>Route\'s code: '+req.params.id+'</p>' +
                            '<p>Still don\'t have an account on Pirineo\'s POI? Enter <a href='+urlSignUp+' target="_blank">here</a> to create one!</p>' +
                            '<p>The Pirineo\'s POI team.</p>'
                        };
                        sendEmail(mailOptions, res);
                    }
                    else{
                        res.status(404).send({
                            "success": false,
                            "message": "La ruta no existe"
                        });
                    }

                });
            }
            else{
                res.status(404).send({
                    "success": false,
                    "message": "El usuario propietario de la ruta no existe"
                });
            }
        });
    });


    /**
     * @swagger
     * /routes/{id}/:
     *   get:
     *     tags:
     *       - Routes
     *     summary: Listar POIs y modo de viaje de una ruta
     *     description: Lista todos los POIs que conforman una ruta, así
     *      como el modo de viaje de la misma.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: Id de la ruta.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Datos de la ruta solicitada.
     *         type: object
     *         properties:
     *           travelMode:
     *             type: string
     *             description:  |
     *               Modo de transporte de la ruta. Valor discreto entre: 'DRIVING' OR 'WALKING' OR
     *               'BICYCLING' OR 'TRANSIT'
     *           routePOIs:
     *             type: array
     *             items:
     *               $ref: '#/definitions/POI'
     *       404:
     *         description: Mensaje de feecback para el usuario.
     *         schema:
     *              $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feecback para el usuario.
     *         schema:
     *              $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/:id", function(req, res){
        Route.findById(req.params.id, function(err, route){

            if (err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            if(route){
                var pois = [];
                async.each(route.routePOIs, function(poiId, callback){

                    POI.findById(poiId, function(err, poi){

                        if (err){
                            res.status(404).send({
                                "success": false,
                                "message": "Error recuperando datos"
                            });
                            return;
                        }
                        if(poi){
                            pois.push(poi.createResponse(""));
                            callback();
                        }
                        else{
                            var error = "El POI "+poiId+" no existe."
                            callback(error);
                        }

                    });

                }, function(err){

                    if (err){
                        res.status(404).send({
                            "success": false,
                            "message": err
                        });
                        return;
                    }
                    res.status(200).send({
                       "routePOIs": pois,
                        "travelMode": route.travelMode
                    });
                });
            }
            else{
                res.status(404).send({
                    "success": false,
                    "message": "La ruta no existe"
                });
            }
        });
    });

    /**
     * Sets up the SMTP server and sends an email
     * with [mailOptions].
     */
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
                res.status(200).send({
                    "success": true,
                    "message": "Ruta enviada correctamente"
                });
            }
        });

    }

    return router;
};
