var express = require('express');
var async = require("async");

module.exports = function (app) {

    var router = express.Router();

    var User = app.models.User;
    var POI = app.models.POI;
    var Route = app.models.Route;


    /**
     * @swagger
     * /adminStats/totalUsers:
     *   get:
     *     tags:
     *       - AdminStats
     *     summary: Número de usuarios totales del sistema
     *     description: Devuelve el número de usuarios totales registrados en el sistema,
     *      incluidos usuarios baneados y usuarios con cuentas desactivadas.
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
     *         description: Número de usuarios totales del sistema.
     *         schema:
     *           type: object
     *           properties:
     *              totalUsers:
     *               type: integer
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/totalUsers", function(req, res){

        if (!req.user.admin) {
            res.status(401).send({
                "success": false,
                "message": "No estás autorizado a acceder."
            });
            return;
        }

        User.count({admin: false}, function(err, users){
            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            res.status(200).send({
                "totalUsers": users
            });
        });
    });

    /**
     * @swagger
     * /adminStats/totalPois:
     *   get:
     *     tags:
     *       - AdminStats
     *     summary: Número de POIs totales del sistema
     *     description: Devuelve el número de POIs totales creados en el sistema.
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
     *         description: Número de POIs totales del sistema.
     *         schema:
     *           type: object
     *           properties:
     *              totalPois:
     *               type: integer
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/totalPois", function(req, res){

        if (!req.user.admin) {
            res.status(401).send({
                "success": false,
                "message": "No estás autorizado a acceder."
            });
            return;
        }

        POI.count({}, function(err, pois){
            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            res.status(200).send({
                "totalPois": pois
            });
        });
    });

    /**
     * @swagger
     * /adminStats/totalRoutes:
     *   get:
     *     tags:
     *       - AdminStats
     *     summary: Número de rutas totales del sistema
     *     description: Devuelve el número de rutas totales creadas en el sistema.
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
     *         description: Número de rutas totales del sistema.
     *         schema:
     *           type: object
     *           properties:
     *              totalRoutes:
     *               type: integer
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/totalRoutes", function(req, res){

        if (!req.user.admin) {
            res.status(401).send({
                "success": false,
                "message": "No estás autorizado a acceder."
            });
            return;
        }

        Route.count({}, function(err, routes){
            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            res.status(200).send({
                "totalRoutes": routes
            });
        });
    });

    /**
     * @swagger
     * /adminStats/usersStatus:
     *   get:
     *     tags:
     *       - AdminStats
     *     summary: Número de usuarios activos, inactivos, baneados temporalmente y permanentes
     *     description: Devuelve el número de usuarios cuyas cuentas se cuentran actualmente
     *      activas, inactivas, con baneos permanentes y con baneos temporales.
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
     *         description: Número de usuarios en cada estado distinto.
     *         schema:
     *           type: object
     *           properties:
     *              usersStatus:
     *               type: array
     *               items:
     *                type: object
     *                properties:
     *                  status:
     *                   type: string
     *                   description: Estado de la cuenta de usuario (activo, inactivo, banP, banT)
     *                  usersNumber:
     *                   type: integer
     *                   description: Número de usuarios en ese estado
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/usersStatus", function(req, res){

        if (!req.user.admin) {
            res.status(401).send({
                "success": false,
                "message": "No estás autorizado a acceder."
            });
            return;
        }

        var statuses = ['Activos', 'Inactivos', 'BaneadosP', 'BaneadosT'];
        var stats = [];
        for(i=0;i<statuses.length;i++){
            var item = {
                "status": statuses[i],
                "usersNumber":0
            };
            stats.push(item);
        }

        //Searches for all active users without a ban
        User.count({isActive: true, banInitDate: null}, function(err, users){

            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }
            stats[statuses.indexOf("Activos")].usersNumber = users;

            //Searches for all inactive users, with or without a ban, it's not important since they are inactive
            User.count({isActive: false}, function(err, users){

                if(err) {
                    res.status(500).send({
                        "success": false,
                        "message": "Error recuperando datos"
                    });
                    return;
                }
                stats[statuses.indexOf("Inactivos")].usersNumber = users;

                User.count({isActive: true, banInitDate: {$ne: null}, banFinishDate: null}, function(err, users){

                    if(err) {
                        res.status(500).send({
                            "success": false,
                            "message": "Error recuperando datos"
                        });
                        return;
                    }
                    stats[statuses.indexOf("BaneadosP")].usersNumber = users;

                    User.count({isActive: true, banFinishDate: {$ne: null}}, function(err, users){

                        if(err) {
                            res.status(500).send({
                                "success": false,
                                "message": "Error recuperando datos"
                            });
                            return;
                        }
                        stats[statuses.indexOf("BaneadosT")].usersNumber = users;

                        res.status(200).send({
                            "usersStatus":stats
                        });
                    });
                });
            });
        });
    });


    /**
     * @swagger
     * /adminStats/poisPerUser:
     *   get:
     *     tags:
     *       - AdminStats
     *     summary: Número medio de pois por usuario
     *     description: Devuelve el número medio de pois totales creados en
     *      el sistema en función del número de usuarios totales registrados en el sistema.
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
     *         description: Número medio de pois por usuario
     *         schema:
     *           type: object
     *           properties:
     *              poisPerUser:
     *               type: integer
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/poisPerUser", function(req, res){

        if (!req.user.admin) {
            res.status(401).send({
                "success": false,
                "message": "No estás autorizado a acceder."
            });
            return;
        }

        User.count({admin: false}, function(err, users){

            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            POI.count({}, function(err, pois){

                if(err) {
                    res.status(500).send({
                        "success": false,
                        "message": "Error recuperando datos"
                    });
                    return;
                }

                res.status(200).send({
                    "poisPerUser":pois/users
                });
            });
        });
    });

    /**
     * @swagger
     * /adminStats/routesPerUser:
     *   get:
     *     tags:
     *       - AdminStats
     *     summary: Número medio de rutas por usuario
     *     description: Devuelve el número medio de rutas totales creados en
     *      el sistema en función del número de usuarios totales registrados en el sistema.
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
     *         description: Número medio de rutas por usuario
     *         schema:
     *           type: object
     *           properties:
     *              routesPerUser:
     *               type: integer
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/routesPerUser", function(req, res){

        if (!req.user.admin) {
            res.status(401).send({
                "success": false,
                "message": "No estás autorizado a acceder."
            });
            return;
        }

        User.count({admin: false}, function(err, users){

            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            Route.count({}, function(err, routes){

                if(err) {
                    res.status(500).send({
                        "success": false,
                        "message": "Error recuperando datos"
                    });
                    return;
                }

                res.status(200).send({
                    "routesPerUser":routes/users
                });
            });
        });
    });


    /**
     * @swagger
     * /adminStats/lastLogins:
     *   get:
     *     tags:
     *       - AdminStats
     *     summary: Número de logins de usuarios por mes durante el último año
     *     description: Devuelve el número de logins de usuarios registrados en el sistema
     *      durante el último año, agrupados por meses.
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
     *         description: Número de usuarios en cada estado distinto.
     *         schema:
     *           type: object
     *           properties:
     *              lastLogins:
     *               type: array
     *               description: Array de tamaño 12, una entrada por cada mes
     *               items:
     *                type: integer
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/lastLogins", function(req, res){

        if (!req.user.admin) {
            res.status(401).send({
                "success": false,
                "message": "No estás autorizado a acceder."
            });
            return;
        }

        var date = new Date();
        var year = date.getFullYear()-1;
        var month = date.getMonth() +1;
        var day = date.getDate();

        User.find({lastLoginDate: {$gte: new Date(year, month, day)}}, '-_id lastLoginDate', function(err, logins){

            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            var lastLogins = new Array(12).fill(0);
            async.each(logins, function(login, callback){

                lastLogins[login.lastLoginDate.getMonth()] += 1;
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
                    "lastLogins": lastLogins
                });

            });
        });
    });


    /**
     * @swagger
     * /adminStats/signUpAndRemove:
     *   get:
     *     tags:
     *       - AdminStats
     *     summary: Número de usuarios nuevos registrados y de cuentas que se han dado de baja
     *     description: Devuelve dos listas que reflejan los nuevos registros y las cuentas
     *      que se han dado de baja en el último año agrupados por meses, respectivamente.
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
     *         description: Número de registros y de bajas en el último año
     *         schema:
     *           type: object
     *           properties:
     *              signUps:
     *               type: array
     *               description: Array de tamaño 12, una entrada por cada mes
     *               items:
     *                type: integer
     *              removes:
     *               type: array
     *               description: Array de tamaño 12, una entrada por cada mes
     *               items:
     *                type: integer
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/signUpAndRemove", function(req, res){

        if (!req.user.admin) {
            res.status(401).send({
                "success": false,
                "message": "No estás autorizado a acceder."
            });
            return;
        }

        var date = new Date();
        var year = date.getFullYear()-1;
        var month = date.getMonth() +1;
        var day = date.getDate();

        User.find({registerDate: {$gte: new Date(year, month, day)}}, '-_id registerDate', function(err, registrations){

            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            var registrationsList = new Array(12).fill(0);
            async.each(registrations, function(registration, callback){

                registrationsList[registration.registerDate.getMonth()] += 1;
                callback();

            }, function(err){

                if (err){
                    res.status(500).send({
                        "success": false,
                        "message": "Error creando respuesta"
                    });
                    return;
                }

                User.find({deactivationDate: {$gte: new Date(year, month, day)}}, '-_id deactivationDate', function(err, deactivations){

                    if(err) {
                        res.status(500).send({
                            "success": false,
                            "message": "Error recuperando datos"
                        });
                        return;
                    }

                    var deactivationsList = new Array(12).fill(0);
                    async.each(deactivations, function(deactivation, callback){

                        deactivationsList[deactivation.deactivationDate.getMonth()] += 1;
                        callback();

                    }, function(err){

                        if(err) {
                            res.status(500).send({
                                "success": false,
                                "message": "Error recuperando datos"
                            });
                            return;
                        }

                        res.status(200).send({
                            "signUps": registrationsList,
                            "removes": deactivationsList
                        });
                    });
                });
            });
        });
    });

    return router;
};
