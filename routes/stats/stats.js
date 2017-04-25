var express = require('express');
var async = require("async");

module.exports = function(app){

    var router = express.Router();

    var User = app.models.User;
    var POI = app.models.POI;
    var Route = app.models.Route;


    /**
     * @swagger
     * /stats/{email}/mostRated:
     *   get:
     *     tags:
     *       - Stats
     *     summary: POIs mejor valorados
     *     description: Obtiene una lista de los 5 POIs mejor valorados del usuario.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userEmail
     *         description: Email del usuario propietario de los POIs.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Lista de los POIs más valorados
     *         schema:
     *           type: object
     *           properties:
     *              pois:
     *               type: array
     *               items:
     *                type: object
     *                properties:
     *                  name:
     *                   type: string
     *                   description: Nombre del POI
     *                  rating:
     *                   type: number
     *                   format: double
     *                   description: Valoración media del POI
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/:email/mostRated", function(req, res){
        res.status(500).send({
            "success": false,
            "message": "Error guardando datos"
        });
    });

    /**
     * @swagger
     * /stats/{email}/mostFavorite:
     *   get:
     *     tags:
     *       - Stats
     *     summary: POIs con más favoritos.
     *     description: Obtiene una lista de los 5 POIs que más favoritos
     *      han obtenido.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userEmail
     *         description: Email del usuario propietario de los POIs.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Lista de los POIs con más favoritos.
     *         schema:
     *           type: object
     *           properties:
     *              pois:
     *               type: array
     *               items:
     *                type: object
     *                properties:
     *                  name:
     *                   type: string
     *                   description: Nombre del POI
     *                  favNumber:
     *                   type: integer
     *                   description: Número de favoritos del POI
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/:email/mostFavorite", function(req, res){

        // It searches for the user.
        User.findOne({"email": req.params.email}, function(err, user){

            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            // If the user exists
            if(user){

                // Searches for all the POIs that the user owns
                POI.find({"owner": req.params.email}, '-_id name favNumber', {sort: {"favNumber": -1}}, function(err, pois){

                    if(err) {
                        res.status(500).send({
                            "success": false,
                            "message": "Error recuperando datos"
                        });
                        return;
                    }

                    // Takes the first 5 POIs from the query's result
                    pois.splice(5, pois.length-5);

                    res.status(200).send({
                        "pois": pois
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
     * /stats/{email}/poiByDate:
     *   get:
     *     tags:
     *       - Stats
     *     summary: POIs creados en el último año.
     *     description: Obtiene una lista de todos los POIs creados en el último año.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userEmail
     *         description: Email del usuario propietario de los POIs.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Lista de los POIs creados en el último año.
     *         schema:
     *           type: object
     *           properties:
     *              pois:
     *               type: array
     *               items:
     *                type: object
     *                properties:
     *                  name:
     *                   type: string
     *                   description: Nombre del POI
     *                  creationDate:
     *                   type: integer
     *                   description: Mes de creación del POI [1-12]
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/:email/poiByDate", function(req, res){
        res.status(500).send({
            "success": false,
            "message": "Error guardando datos"
        });
    });


    /**
     * @swagger
     * /stats/{email}/poiByLocation:
     *   get:
     *     tags:
     *       - Stats
     *     summary: POIs creados según continente.
     *     description: Obtiene una lista de todos los POIs creados en cada continente.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userEmail
     *         description: Email del usuario propietario de los POIs.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Lista de los POIs creados en cada continente.
     *         schema:
     *           type: object
     *           properties:
     *              pois:
     *               type: array
     *               items:
     *                type: object
     *                properties:
     *                  continent:
     *                   type: string
     *                   description: Nombre del continente
     *                  poiNumber:
     *                   type: integer
     *                   description: Número de POIs creados en el continente
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/:email/poiByLocation", function(req, res){
        res.status(500).send({
            "success": false,
            "message": "Error guardando datos"
        });
    });

    /**
     * @swagger
     * /stats/{email}/duplicatedPois:
     *   get:
     *     tags:
     *       - Stats
     *     summary: Lista de los POIs más duplicados.
     *     description: Obtiene una lista de los 5 POIs del usuario más duplicados.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userEmail
     *         description: Email del usuario propietario de los POIs.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Lista de los POIs más duplicados.
     *         schema:
     *           type: object
     *           properties:
     *              pois:
     *               type: array
     *               items:
     *                type: object
     *                properties:
     *                  name:
     *                   type: string
     *                   description: Nombre del POI.
     *                  duplicated:
     *                   type: integer
     *                   description: Número veces que se ha duplicado.
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/:email/duplicatedPois", function(req, res){
        res.status(500).send({
            "success": false,
            "message": "Error guardando datos"
        });
    });

    /**
     * @swagger
     * /stats/{email}/followers:
     *   get:
     *     tags:
     *       - Stats
     *     summary: Número de seguidores
     *     description: Número de seguidores del usuario.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userEmail
     *         description: Email del usuario propietario de los POIs.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Número de seguidores del usuario.
     *         schema:
     *           type: object
     *           properties:
     *              followers:
     *               type: integer
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/:email/followers", function(req, res){
        res.status(500).send({
            "success": false,
            "message": "Error guardando datos"
        });
    });

    /**
     * @swagger
     * /stats/{email}/longestRoutes:
     *   get:
     *     tags:
     *       - Stats
     *     summary: Lista de las rutas más duraderas.
     *     description: Obtiene una lista de las 5 rutas más duraderas creadas por el usuario.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userEmail
     *         description: Email del usuario propietario de los POIs.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Lista de las rutas más duraderas.
     *         schema:
     *           type: object
     *           properties:
     *              routes:
     *               type: array
     *               items:
     *                type: object
     *                properties:
     *                  routeId:
     *                   type: string
     *                   description: Id de la ruta
     *                  duration:
     *                   type: integer
     *                   description: Duración de la ruta en segundos.
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/:email/longestRoutes", function(req, res){
        res.status(500).send({
            "success": false,
            "message": "Error guardando datos"
        });
    });

    /**
     * @swagger
     * /stats/{email}/longestRoutesByDistance:
     *   get:
     *     tags:
     *       - Stats
     *     summary: Lista de las rutas más largas.
     *     description: Obtiene una lista de las 5 rutas más largas creadas por el usuario.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userEmail
     *         description: Email del usuario propietario de los POIs.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Lista de las rutas ḿás largas.
     *         schema:
     *           type: object
     *           properties:
     *              routes:
     *               type: array
     *               items:
     *                type: object
     *                properties:
     *                  routeId:
     *                   type: string
     *                   description: Id de la ruta.
     *                  length:
     *                   type: integer
     *                   description: Longitud de la ruta
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/:email/longestRoutesByDistance", function(req, res){
        res.status(500).send({
            "success": false,
            "message": "Error guardando datos"
        });
    });

    /**
     * @swagger
     * /stats/{email}/poisInRoutes:
     *   get:
     *     tags:
     *       - Stats
     *     summary: Lista del número de rutas por el número de POIs.
     *     description: Obtiene una lista del número de rutas que tienen
     *      un determinado número de POIs en rangos de 5. El último rango es 31+.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userEmail
     *         description: Email del usuario propietario de los POIs.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Lista del número de rutas por número de POIs.
     *         schema:
     *           type: object
     *           properties:
     *              routes:
     *               type: array
     *               items:
     *                type: object
     *                properties:
     *                  routesNumber:
     *                   type: integer
     *                   description: Número de rutas
     *                  rank:
     *                   type: string
     *                   description: Rango del número de POIs
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/:email/poisInRoutes", function(req, res){
        res.status(500).send({
            "success": false,
            "message": "Error guardando datos"
        });
    });

    /**
     * @swagger
     * /stats/{email}/transportsUsage:
     *   get:
     *     tags:
     *       - Stats
     *     summary: Lista del número de rutas que usan cada transporte.
     *     description: Obtiene una lista del número de rutas que emplean
     *      cada tipo de transporte.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userEmail
     *         description: Email del usuario propietario de los POIs.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Lista del número de rutas por transporte.
     *         schema:
     *           type: object
     *           properties:
     *              routes:
     *               type: array
     *               items:
     *                type: object
     *                properties:
     *                  routesNumber:
     *                   type: integer
     *                   description: Número de rutas
     *                  transport:
     *                   type: string
     *                   description: |
     *                     Transporte empleado por las rutas. Valor discreto entre:
     *                     'En coche', 'Transporte público', 'A pie', y  'En bicicleta'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/:email/transportsUsage", function(req, res){
        res.status(500).send({
            "success": false,
            "message": "Error guardando datos"
        });
    });

    /**
     * @swagger
     * /stats/{email}/mostRequestedRoutesById:
     *   get:
     *     tags:
     *       - Stats
     *     summary: Lista de las rutas más recreadas por ID.
     *     description: Obtiene una lista de las 5 rutas más recreadas
     *      a partir de su ID.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userEmail
     *         description: Email del usuario propietario de los POIs.
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Lista de las rutas más recreadas por ID.
     *         schema:
     *           type: object
     *           properties:
     *              routes:
     *               type: array
     *               items:
     *                type: object
     *                properties:
     *                  routeId:
     *                   type: string
     *                   description: Id de la ruta
     *                  requestedNumber:
     *                   type: integer
     *                   description: Número de veces que se ha recreado por ID
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/:email/mostRequestedRoutesById", function(req, res){
        res.status(500).send({
            "success": false,
            "message": "Error guardando datos"
        });
    });

    return router;

};
