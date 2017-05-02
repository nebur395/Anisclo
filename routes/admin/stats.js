var express = require('express');

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

        User.count({}, function(err, users){
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

    return router;
};
