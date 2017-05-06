var express = require('express');
var bs58 = require("bs58");
var ip = require('ip');

module.exports = function (app){

    var router = express.Router();

    var Url = app.models.Url;

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
     *       - name: Authorization
     *         description: |
     *           JWT estándar: `Authorization: Bearer + JWT`.
     *         in: header
     *         required: true
     *         type: string
     *         format: byte
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
     *              urlShort:
     *                  type: string
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

        // Checks all body fields
        if(!req.body.url){
            res.status(404).send({
                "success": false,
                "message": "URL no válida"
            });
            return;
        }

        Url.create({

            originalUrl: req.body.url

        }, function(err, result){

            if(err){
                res.status(500).send({
                    "success": false,
                    "message": "Error guardando datos"
                });
            }
            else{
                var encodedId = bs58.encode(new Buffer(result._id.toString(), 'hex'));
                var ipAddr = ip.address();
                var shortUrl = "http://"+ipAddr+":8080/url/"+encodedId;
                res.status(200).send({
                   "urlShort": shortUrl
                });
            }
        });
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

        var urlId = new Buffer(bs58.decode(req.params.id)).toString('hex');
        Url.findById(urlId, function(err, url){

            if (err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            if(url){
                res.redirect(url.originalUrl);
            }
            else{
                res.status(404).send({
                    "success": false,
                    "message": "La URL no existe"
                });
            }
        })
    });

    return router;
};

