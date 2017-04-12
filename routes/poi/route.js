

module.exports = function (app) {

    var router = express.Router();
    var User = app.models.User;

    /**
     * @swagger
     * /routes/:
     *   post:
     *     tags:
     *       - Routes
     *     summary: Guardar una ruta
     *     description: Se guarda una nueva ruta creada por un usuario.
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
     *       - name: route
     *         description: Ruta creada por el usuario. Un array que contiene en los índices las instrucciones del gps.
     *         in: body
     *         required: true
     *         type: array
     *         items:
     *           type: object
     *           properties:
     *             instructions:
     *               type: string
     *               description: Descripción del gps que hay que seguir en este punto de la ruta.
     *             distance:
     *               type: number
     *               description: Distancia recorrida.(expresado en ?)
     *             duration:
     *               type: number
     *               description: Duración de la distancia recorrida. (expresado en ?)
     *             init:
     *               type: string
     *               description: Inicio de la ruta.
     *             final:
     *               type: string
     *               description: final de la ruta
     *             transport:
     *               type: string
     *               description: Método de transporte de la ruta.
     *     responses:
     *       200:
     *         description: Mensaje de feecback para el usuario.
     *         schema:
     *              $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feecback para el usuario.
     *         schema:
     *              $ref: '#/definitions/FeedbackMessage'
     */
    router.post("/", function(req, res){

    });

    return router;
};
