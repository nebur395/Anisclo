var express = require('express');

module.exports = function (app){

    var router = express.Router();

    /**
     * @swagger
     * /url/:
     *   post:
     *     tags:
     *       - Url
     *     summary: Acortar una URL
     *     description: Crea una URL acortada a partir de la URL que se proporciona
     *      y la devuelve.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: url
     *         description: URL que se quiere acortar.
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: URL acortada.
     *         schema:
     *          type: object
     *          properties:
     *              url:
     *                  type: string
     *
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.post("/", function(req, res){

    });

    /**
     * @swagger
     * /url/{id}:
     *   post:
     *     tags:
     *       - Url
     *     summary: Redirige a la URL correspondiente a la URL acortada
     *     description: Mapea la URL acortada (el id en base 58) en busca de su URL real
     *      y redirige a esa dirección.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: ID codificado en base 58 de la URL acortada
     *         in: path
     *         required: true
     *         type: string
     *     responses:
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/:id", function(req, res){

    });

    return router;
};

