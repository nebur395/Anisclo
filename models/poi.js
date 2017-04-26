var mongoose = require("mongoose");

mongoose.Promise = global.Promise;

/**
 * @swagger
 * definition:
 *   POI:
 *     description: Schema del modelo de POI que representa un POI público del sistema.
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *         uniqueItems: true
 *         required: true
 *         description: ID del POI en el sistema.
 *       name:
 *         type: string
 *         required: true
 *         description: Nombre del POI.
 *       description:
 *         type: string
 *         required: true
 *         description: Descripción del POI.
 *       tags:
 *         type: string
 *         required: true
 *         description: Conjunto de tags del POI separados por un '#'.
 *       lat:
 *         type: number
 *         format: double
 *         required: true
 *         description: Latitud del POI.
 *       lng:
 *         type: number
 *         format: double
 *         required: true
 *         description: Longitud del POI.
 *       owner:
 *         type: string
 *         required: true
 *         description: Email del usuario que ha creado el POI que sirve como identificador.
 *       image:
 *         type: string
 *         required: true
 *         description: String en base64 que representa la imagen adjunta al POI, si la hay.
 *          Si no la hay, será un carácter vacío.
 *       url:
 *         type: string
 *         required: true
 *         description: URL adjunto al POI. Si no hay URL adjunto, será un carácter vacío.
 */

// Create the Schema
var poiSchema = mongoose.Schema({

    name: {type: String, required: true},
    description: {type: String, required: true},
    tags: {type: [String], required: true},
    lat: {type: Number, required: true},
    lng: {type: Number, required: true},
    location: {type: String, required: true},
    owner: {type: String, required: true},
    rating: {type: [Number], default: []},
    ratingAvg: {type: Number, default: 0},
    favNumber: {type: Number, default: 0},
    duplicated: {type: Number, default: 0},
    url: {type: String, default: ""},
    image: {type:mongoose.Schema.Types.ObjectId, default: null},
    creationDate: {type: Date, default: Date.now}

});

/**
 * Creates a JSON object with all the fields of the POI
 * excluding the rating, creation date and __v fields.
 * It also sets the image attached to the POI, changing the
 * ObjectID for a string in base-64 enconding
 * or the null for a blank string if there's no image.
 * Besides, it transforms the tags array in a string with
 * the tags separated by a "#".
 */
poiSchema.methods.createResponse = function(imageData){
    var poi = this.toJSON();
    delete poi.rating;
    delete poi.ratingAvg;
    delete poi.creationDate;
    delete poi.favNumber;
    delete poi.duplicated;
    delete poi.location;
    delete poi.__v;
    poi.image = imageData;

    var tagsString = '';
    for(i=0; i < poi.tags.length; i++){
        tagsString += "#"+poi.tags[i];
    }
    poi.tags = tagsString;
    return poi;
};

// Create the model if it does not exists
module.exports = mongoose.model('POI', poiSchema);
