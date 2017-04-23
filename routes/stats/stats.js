var express = require('express');

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
    router.get("/:email/poisInRoutes", function(req, res){

    });

    router.get("/transportsUsage", function(req, res){

    });

    router.get("/mostRequestedRoutesById", function(req, res){

    });

};
