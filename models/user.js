var mongoose = require("mongoose");

/**
 * @swagger
 * definition:
 *   User:
 *     description: Schema del modelo de User que representa un usuario público del sistema.
 *     type: object
 *     properties:
 *       email:
 *         type: string
 *         uniqueItems: true
 *         required: true
 *         description: Email del usuario que sirve como identificador.
 *       name:
 *         type: string
 *         required: true
 *         description: Nombre del usuario.
 *       lastname:
 *         type: string
 *         required: true
 *         description: Apellido del usuario.
 *       admin:
 *         type: boolean
 *         required: true
 *         description: True si el usuario es un administrador.
 *       firstLogin:
 *         type: boolean
 *         required: true
 *         description: True si el usuario es la primera vez que inicia sesión tras haberse
 *           creado la cuenta o cambiado la contraseña.
 */

// Create the Schema
var userSchema = mongoose.Schema({
    email : {type: String, required: true, unique: true},
    password: {type: String},
    name: {type: String, required: true},
    lastname: {type: String, required: true},
    admin: {type: Boolean, required: true},
    firstLogin: {type: Boolean, required: true},
    favs: {type:[mongoose.Schema.Types.ObjectId], default: []},
    registerDate: {type: Date, default: Date.now}
});

// Create the model if it does not exists
module.exports = mongoose.model('User', userSchema);
