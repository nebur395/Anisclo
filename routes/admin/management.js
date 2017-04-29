var express = require('express');

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
     *      el admin puede acceder.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           type: array
     *           items:
     *             $ref: '#/definitions/UserForAdmin'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/", function(req, res){

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
    router.put("/users/:email/permanentBan", function(req, res){

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
    router.put("/users/:email/permanentBan", function(req, res){

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
    router.put("/users/:email/permanentBan", function(req, res){

    });

    return router;
};
