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

    return router;
};
