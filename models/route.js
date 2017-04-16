var mongoose = require("mongoose");

/**
 * @swagger
 * definition:
 *   Route:
 *     description: Schema del modelo de Route que representa un una ruta pública del sistema.
 *     type: object
 *     properties:
 *       routePOIs:
 *         type: array
 *         items:
 *          type: string
 *         required: true
 *         description: IDs de los POIs que conforman la ruta.
 *       travelMode:
 *         type: string
 *         required: true
 *         description: Modo de viaje para la ruta.
 */

// Create the Schema
var routeSchema = mongoose.Schema({

    owner: {type: String, required: true},
    travelMode: {type: String, required: true},
    routePOIs: {type: [mongoose.Schema.Types.ObjectId], required: true},
    routeInfo : {type: [mongoose.Schema.Types.Mixed], required: true},
    creationDate: {type: Date, default: Date.now}

});

routeSchema.methods.createResponse = function(){
    var route = this.toJSON();
    delete route._id;
    delete route.__v;
    delete route.creationDate;
    delete route.routeInfo;
    delete route.owner;
    return route;
}

// Create the model if it does not exists
module.exports = mongoose.model('Route', routeSchema);
