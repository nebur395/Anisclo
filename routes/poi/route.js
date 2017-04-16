

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
     *         description: Lista de los POIs que componen la ruta para poder reproducirla.
     *         in: body
     *         required: true
     *         type: array
     *         items:
     *           $ref: '#/definitions/POI'
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
     *         description: Mensaje de feecback para el usuario.
     *         type: object
     *         properties:
     *           routeID:
     *             type: string
     *             description: ID de la ruta guardada en el sistema para poder reproducirla
     *               posteriormente.
     *       500:
     *         description: Mensaje de feecback para el usuario.
     *         schema:
     *              $ref: '#/definitions/FeedbackMessage'
     */
    router.post("/", function(req, res){

    });

    return router;
};
