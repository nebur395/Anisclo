var express = require('express');
var grid = require("gridfs-stream");
var semaphore = require("semaphore")(1);
var mongoose = require("mongoose");
var fs = require("fs");
var async = require("async");
var Readable = require('stream').Readable;
var bs58 = require("bs58");
grid.mongo = mongoose.mongo;


module.exports = function (app) {

    var router = express.Router();

    var User = app.models.User;
    var POI = app.models.POI;
    var Url = app.models.Url;

    /**
     * @swagger
     * /pois/:
     *   get:
     *     tags:
     *       - POIs
     *     summary: Obtener POIs
     *     description: Devuelve una lista con todos los POIs en el sistema.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: Lista con todos los POIs del sistema.
     *         schema:
     *           type: object
     *           properties:
     *              pois:
     *               type: array
     *               items:
     *                $ref: '#/definitions/POI'
     *       500:
     *          description: Mensaje de feecback para el usuario.
     *          schema:
     *              $ref: '#/definitions/FeedbackMessage'
     */

    router.get("/", function(req, res){

        // Sets the mongo database connection to gridfs in order to store and retrieve files in the DB.
        gfs = grid(mongoose.connection.db);

        POI.find({}, function(err, result){

            if (err){
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            if (result.length==0){
                res.status(200).send({
                    "pois":result
                });
            }

            else{
                var pois = [];
                // Iterates all the POIs stored in the system
                async.each(result, function(poi, callback){

                    // Checks if there's an image attached to the POI and retrieves it if it's the case.
                    if(poi.image!=null){
                        retrieveImage(poi.image, function(data){
                            pois.push(poi.createResponse(data));
                            callback();
                        });
                    }
                    else{
                        pois.push(poi.createResponse(""));
                        callback();
                    }

                }, function(err){
                    if (err){
                        res.status(500).send({
                            "success": false,
                            "message": "Error creando respuesta"
                        });
                        return;
                    }
                    res.status(200).send({
                        "pois": pois
                    });
                });
            }
        });

    });

    /**
     * @swagger
     * /pois/:
     *   post:
     *     tags:
     *       - POIs
     *     summary: Crear POI
     *     description: Crea un nuevo POI en el sistema.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userEmail
     *         description: Email del usuario que sirve como identificador.
     *         in: body
     *         required: true
     *         type: string
     *       - name: poi
     *         description: Información del POI que se va a añadir
     *         in: body
     *         required: true
     *         schema:
     *          type: object
     *          properties:
     *              name:
     *               type: string
     *              description:
     *               type: string
     *              tags:
     *               type: string
     *              lat:
     *               type: number
     *               format: double
     *              lng:
     *               type: number
     *               format: double
     *              url:
     *               type: string
     *               required: false
     *              image:
     *               type: string
     *               required: false
     *               description: base64-encoded image
     *     responses:
     *       200:
     *         description: El POI que se acaba de crear.
     *         schema:
     *           type: object
     *           properties:
     *              poi:
     *                $ref: '#/definitions/POI'
     *       404:
     *          description: Mensaje de feedback para el usuario.
     *          schema:
     *              $ref: '#/definitions/FeedbackMessage'
     *       500:
     *          description: Mensaje de feecback para el usuario.
     *          schema:
     *              $ref: '#/definitions/FeedbackMessage'
     */
    router.post("/", function(req, res){
        
        // Sets the mongo database connection to gridfs in order to store and retrieve files in the DB.
        gfs = grid(mongoose.connection.db);

        // Checks all body fields
        if(!req.body.userEmail || !req.body.poi){
            res.status(404).send({
                "success": false,
                "message": "Usuario o POI incorrectos"
            });
            return;
        }
        // Checks all POI fields
        if(!req.body.poi.name || !req.body.poi.description || !req.body.poi.tags ||
            !req.body.poi.lat || !req.body.poi.lng){
            res.status(404).send({
                "success": false,
                "message": "Uno o más campos del POI son incorrectos"
            });
            return;
        }

        // It searches for the user.
        User.findOne({"email": req.body.userEmail}, function(err, user){

            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            // If the user exists.
            if(user){
                if(req.body.poi.tags.charAt(0)==='#'){
                    // Transforms all the tags to an array with the tags in lowercase
                    tagsToArray(req.body.poi.tags, function(lowerCaseTags){
                        // Creates a new POI with the basic and required info.
                        var newPoi = new POI({

                            name: req.body.poi.name,
                            description: req.body.poi.description,
                            tags: lowerCaseTags,
                            lat: req.body.poi.lat,
                            lng: req.body.poi.lng,
                            owner: req.body.userEmail
                        });

                        if(req.body.poi.url){
                            newPoi.url = req.body.poi.url;
                        }

                        // Checks if there's an image attached to the POI.
                        if(req.body.poi.image){
                            // TODO: Extraer nombre y path de la request
                            var name = req.body.poi.name + "_image";

                            // Creates a readable stream with the image string that is in base64
                            var imageStream = new Readable();
                            imageStream.push(req.body.poi.image);
                            imageStream.push(null);
                            // Stores the image in the system and adds it to the POI
                            storeImage(name, imageStream, function(imageId){
                                newPoi.image = imageId;
                                newPoi.save(function(err, result){
                                    if(err){
                                        res.status(500).send({
                                            "success": false,
                                            "message": "Error guardando POI"
                                        });
                                    }
                                    else{
                                        retrieveImage(imageId, function(data){
                                            res.status(200).send({
                                                "poi":result.createResponse(data)
                                            });
                                        });
                                    }
                                });
                            });
                        }
                        // If there's no image attached to the POI, it stores the POI in the system.
                        else{
                            newPoi.save(function(err, result){
                                if(err){
                                    res.status(500).send({
                                        "success": false,
                                        "message": "Error guardando POI"
                                    });
                                }
                                else{
                                    res.status(200).send({
                                        "poi":result.createResponse("")
                                    });
                                }
                            });
                        }
                    });
                }
                else{
                    res.status(404).send({
                        "success": false,
                        "message": "Tags incorrectos"
                    });
                }
            }
            // If the user doesn't exist.
            else {
                res.status(404).send({
                    "success": false,
                    "message": "El usuario no existe"
                });
            }
        });

    });

    /**
     * @swagger
     * /pois/filter/:
     *   get:
     *     tags:
     *       - POIs
     *     summary: Buscar POIs por tags
     *     description: Busca los POIs que contengan los tags que se
     *      han indicado y devuelve una lista con ellos.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: tags
     *         description: Conjunto de tags separados por un '#'.
     *         in: header
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: Lista con todos los POIs del sistema.
     *         schema:
     *           type: object
     *           properties:
     *              pois:
     *               type: array
     *               items:
     *                $ref: '#/definitions/POI'
     *       404:
     *          description: Mensaje de feedback para el usuario.
     *          schema:
     *              $ref: '#/definitions/FeedbackMessage'
     *       500:
     *          description: Mensaje de feecback para el usuario.
     *          schema:
     *              $ref: '#/definitions/FeedbackMessage'
     */
    router.get("/filter", function(req, res){

        var tags = req.headers["tags"];
        console.log(tags);
        if(tags.charAt(0)==='#'){
            // Transforms all the tags to an array with the tags in lowercase
            tagsToArray(tags, function(lowerCaseTags){
                // Searches for the POIs that match with the tags
                POI.find({"tags": {$in: lowerCaseTags}}, function(err, result){

                    if(err) {
                        res.status(500).send({
                            "success": false,
                            "message": "Error recuperando datos"
                        });
                        return;
                    }

                    // If no POI match with the tags, it returns an empty array
                    if (result.length==0){
                        res.status(200).send({
                            "pois":result
                        });
                    }
                    else{
                        var pois = [];
                        // Iterates all the POIs stored in the system
                        async.each(result, function(poi, callback){

                            // Checks if there's an image attached to the POI and retrieves it if it's the case.
                            if(poi.image!=null){
                                retrieveImage(poi.image, function(data){
                                    pois.push(poi.createResponse(data));
                                    callback();
                                });
                            }
                            else{
                                pois.push(poi.createResponse(""));
                                callback();
                            }

                        }, function(err){
                            if (err){
                                res.status(500).send({
                                    "success": false,
                                    "message": "Error creando respuesta"
                                });
                                return;
                            }
                            res.status(200).send({
                                "pois": pois
                            });
                        });
                    }

                });
            });
        }
        else{
            res.status(404).send({
                "success": false,
                "message": "Tags incorrectos"
            });
        }
    });

    /**
     * @swagger
     * /pois/{id}/rate:
     *   put:
     *     tags:
     *       - POIs
     *     summary: Valorar un POI
     *     description: Añade la valoración indicada a la lista
     *      de valoraciones del POI.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: ID del POI al que se va a añadir la valoración.
     *         in: path
     *         required: true
     *         type: string
     *       - name: rating
     *         description: Valoración que se va a añadir al POI
     *         in: body
     *         required: true
     *         type: integer
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
    router.put("/:id/rate", function(req, res){

        // Checks all body fields
        if(!req.body.rating && req.body.rating!==0){
            res.status(404).send({
                "success": false,
                "message": "Valoración incorrecta."
            });
            return;
        }

        POI.findById(req.params.id, function(err, poi){

            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos."
                });
                return;
            }

            if(poi){

                var rating = req.body.rating;
                // Checks if the rating is a valid one
                if(rating>-1 && rating<6){
                    poi.rating.push(rating);
                    poi.save(function(err, result){

                        if(err) {
                            res.status(500).send({
                                "success": false,
                                "message": "Error guardando datos."
                            });
                        }
                        else{
                            res.status(200).send({
                                "success": true,
                                "message": "Valoración añadida correctamente."
                            });
                        }
                    });
                }
                // If the rating is not valid
                else{
                    res.status(404).send({
                        "success": false,
                        "message": "Valoración no válida. Indique una valoración entre 1 y 5."
                    });
                }
            }
            else{
                res.status(404).send({
                    "success": false,
                    "message": "El POI no existe."
                });
            }
        });
    });

    /**
     * @swagger
     * /pois/{id}:
     *   post:
     *     tags:
     *       - POIs
     *     summary: Duplicar un POI
     *     description: Duplica un POI existente y lo añade a los POIs del usuario. Al POI duplicado se le añade al
     *       nombre + "_Duplicado" (p.ej., nombre -> nombre_Duplicado).
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: ID del POI que se va a duplicar.
     *         in: path
     *         required: true
     *         type: string
     *       - name: userEmail
     *         description: Email del usuario que va a obtener el duplicado del POI
     *          y que sirve como identificador.
     *         in: body
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: El POI que se acaba de duplicar.
     *         schema:
     *           type: object
     *           properties:
     *              poi:
     *                $ref: '#/definitions/POI'
     *       404:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     *       500:
     *         description: Mensaje de feedback para el usuario.
     *         schema:
     *           $ref: '#/definitions/FeedbackMessage'
     */
    router.post("/:id", function(req, res){

        // Sets the mongo database connection to gridfs in order to store and retrieve files in the DB.
        gfs = grid(mongoose.connection.db);

        // Checks all body fields
        if(!req.body.userEmail){
            res.status(404).send({
                "success": false,
                "message": "Usuario incorrecto"
            });
            return;
        }

        // It searches for the user which will have the duplicate.
        User.findOne({"email": req.body.userEmail}, function(err, user){

            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            // If the user exists.
            if(user){

                // Checks if the POI that is going to be duplicated exists.
                POI.findById(req.params.id, function(err, poi){

                    if(err) {
                        res.status(500).send({
                            "success": false,
                            "message": "Error recuperando datos"
                        });
                        return;
                    }

                    // If the POI exists.
                    if(poi){

                        // Creates the duplicate and remove the unwanted fields.
                        var duplicate = poi.toJSON();
                        delete duplicate._id;
                        delete duplicate.__v;
                        delete duplicate.owner;
                        delete duplicate.creationDate;
                        delete duplicate.rating;
                        // Sets the new owner of the duplicated POI.
                        duplicate.owner = req.body.userEmail;
                        // Adds a suffix to indicate that is a duplicate of another POI
                        duplicate.name += "_duplicado";

                        // Creates the POI model objetc and saves it.
                        var duplicatedPoi = new POI(duplicate);
                        duplicatedPoi.save(function(err, result){
                            if(err){
                                res.status(500).send({
                                    "success": false,
                                    "message": "Error guardando POI"
                                });
                            }
                            // If there's an image attached to the duplicated POI
                            else if(result.image!==null){
                                retrieveImage(result.image, function(data){
                                    res.status(200).send({
                                        "poi": result.createResponse(data)
                                    });
                                });
                            }
                            // If there's no image attached to the duplicated POI
                            else{
                                res.status(200).send({
                                    "poi": result.createResponse("")
                                });
                            }
                        });
                    }
                    // If the POI doesn't exist.
                    else{
                        res.status(404).send({
                            "success": false,
                            "message": "El POI no existe"
                        });
                    }
                })

            }
            // If the user doesn't exist.
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
     * /pois/{id}:
     *   delete:
     *     tags:
     *       - POIs
     *     summary: Eliminar un POI
     *     description: Elimina un POI existente del usuario, incluida la imagen adjunta,
     *      si la hay, y la URL acortada, si se ha acortado.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: ID del POI que se va a eliminar.
     *         in: path
     *         required: true
     *         type: string
     *       - name: userEmail
     *         description: Email del usuario propietario del POI que se va a eliminar.
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
    router.delete("/:id", function(req, res){

        gfs = grid(mongoose.connection.db);

        // Checks all body fields
        if(!req.body.userEmail){
            res.status(404).send({
                "success": false,
                "message": "Usuario incorrecto"
            });
            return;
        }

        // Checks if the user exists
        User.findOne({"email": req.body.userEmail}, function(err, user){

            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            // If the user exists.
            if(user){
                // Takes the token in order to prevent inconsistency in the system during the operation
                semaphore.take(function(){

                    // Searches for the POI with the given ID and user and removes it
                    POI.findOneAndRemove({"_id": req.params.id, "owner": req.body.userEmail}, function(err, result){

                        if(err) {
                            semaphore.leave();
                            res.status(500).send({
                                "success": false,
                                "message": "Error recuperando y eliminando datos"
                            });
                            return;
                        }

                        // If the POI doesn't exist.
                        if(result===null){
                            semaphore.leave();
                            res.status(404).send({
                                "success": false,
                                "message": "El POI no existe o no eres su propietario"
                            });
                        }
                        // If the POI exists and it's been removed
                        else{
                            // It calls a function that removes the image and url attached to the POI, if any
                            removeUrlAndImage(result, function(){
                                semaphore.leave();
                                res.status(200).send({
                                    "success": true,
                                    "message": "POI eliminado correctamente"
                                });
                            });
                        }
                    });
                });
            }
            // If the user doesn't exist.
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
     * /pois/{id}:
     *   put:
     *     tags:
     *       - POIs
     *     summary: Modificar POI
     *     description: Modifica un POI existente del usuario con nueva información.
     *     consumes:
     *       - application/json
     *       - charset=utf-8
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: ID del POI que se va a eliminar.
     *         in: path
     *         required: true
     *         type: string
     *       - name: userEmail
     *         description: Email del usuario propietario del POI que se va a modificar.
     *         in: body
     *         required: true
     *         type: string
     *       - name: poi
     *         description: Información que se va a editar en el POI.
     *         in: body
     *         required: true
     *         schema:
     *          type: object
     *          properties:
     *              name:
     *               type: string
     *              description:
     *               type: string
     *              tags:
     *               type: string
     *              lat:
     *               type: number
     *               format: double
     *              lng:
     *               type: number
     *               format: double
     *              url:
     *               type: string
     *               required: false
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
    router.put("/:id", function(req, res){

        // Checks all body fields
        if(!req.body.userEmail || !req.body.poi){
            res.status(404).send({
                "success": false,
                "message": "Usuario o POI incorrectos"
            });
            return;
        }
        // Checks all POI fields
        if(!req.body.poi.name || !req.body.poi.description || !req.body.poi.tags ||
            !req.body.poi.lat || !req.body.poi.lng){
            res.status(404).send({
                "success": false,
                "message": "Uno o más campos del POI son incorrectos"
            });
            return;
        }

        // Checks if the user exists
        User.findOne({"email": req.body.userEmail}, function(err, user){

            if(err) {
                res.status(500).send({
                    "success": false,
                    "message": "Error recuperando datos"
                });
                return;
            }

            // If the user exists
            if(user){
                // Searches for the POI with the given ID and user
                POI.findOne({"_id":req.params.id, "owner":req.body.userEmail}, function(err, poi){

                    if(err) {
                        res.status(500).send({
                            "success": false,
                            "message": "Error recuperando datos"
                        });
                        return;
                    }

                    // If the POI with that ID and user exists
                    if(poi){
                        if(req.body.poi.tags.charAt(0)==='#'){
                            // Transforms all the tags to an array with the tags in lowercase
                            tagsToArray(req.body.poi.tags, function(lowerCaseTags){
                                // Updates every modifiable field in the POI
                                poi.name = req.body.poi.name;
                                poi.description = req.body.poi.description;
                                poi.tags = lowerCaseTags;
                                poi.lat = req.body.poi.lat;
                                poi.lng = req.body.poi.lng;

                                // Checks if the request have a new URL for the POI, since it's an optional field
                                if(req.body.poi.url){
                                    poi.url = req.body.poi.url;
                                }

                                // Saves the POI with the new info
                                poi.save(function(err, result){

                                    if(err) {
                                        res.status(500).send({
                                            "success": false,
                                            "message": "Error actualizando POI"
                                        });
                                    }
                                    else{
                                        res.status(200).send({
                                            "success": true,
                                            "message": "POI actualizado correctamente"
                                        });
                                    }
                                });
                            });
                        }
                        else{
                            res.status(404).send({
                                "success": false,
                                "message": "Tags incorrectos"
                            });
                        }
                    }
                    // If the POI with that ID and user doesn't exist
                    else{
                        res.status(404).send({
                            "success": false,
                            "message": "El POI no existe o no eres su propietario"
                        });
                    }
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
     *  Stores a new image in the system.
     */
    function storeImage(name, readStream, callback){
        var writestream = gfs.createWriteStream({
            filename: name
        });
        readStream.pipe(writestream);
        writestream.on('close', function(file){
            return callback(file._id)
        });
    }

    /**
     * Gets the image data from the system, returning
     * a string encoded in base-64.
     */
    function retrieveImage(imageId, callback){
        var buffer = new Buffer('');
        var readstream = gfs.createReadStream({
            _id: imageId
        });

        readstream.on("data", function(chunk){
            if(!buffer){
                buffer = chunk;
            }
            else{
                buffer = Buffer.concat([buffer, chunk]);
            }
        });

        readstream.on("end", function(){
            return callback(buffer.toString());
        });
    }

    /**
     * Removes the image and the URL attached to the
     * POI, if any, and if they are not attached
     * to any other POI. It uses an auxiliary function
     * to remove the URL.
     */
    function removeUrlAndImage(poi, callback){

        // Cheks if the POI has an image attached to it.
        if(poi.image!==null){
            // If there's an image attached, it searches for other POIs with that image
            POI.find({"image": poi.image}, function(err, result){

                if(err) {
                    return callback();
                }

                // If there're no other POIs that have this image attached
                if(result.length==0){
                    // Removes the image from the system.
                    gfs.remove({

                        _id: poi.image

                    }, function(err){
                        if(err) {
                            return callback();
                        }

                        // Checks if the POI has an URL attached to it.
                        if(poi.url!==''){
                            // If there's and URL attached, it calls a function to remove it.
                            removeUrl(poi.url, function(){
                                return callback();
                            });
                        }
                        else{
                            return callback();
                        }
                    })
                }
                // If any other POI have this image attached, checks if there's an URL attached to it.
                else if(poi.url!==''){
                    // If there's and URL attached, it calls a function to remove it.
                    removeUrl(poi.url, function(){
                        return callback();
                    });
                }
                else{
                    return callback();
                }
            });
        }
        // If there's no image attached to the POI, it checks if there's an URL attached to it.
        else if(poi.url!==''){
            // If there's and URL attached, it calls a function to remove it.
            removeUrl(poi.url, function(){
                return callback();
            });
        }
        // If there's nothing attached to the POI.
        else{
            return callback();
        }
    }

    /**
     * Removes an URL attached to a POI if it
     * isn't attached to any other POI.
     */
    function removeUrl(url, callback){
        // Searches for the URL in all the POIs in the system
        POI.find({"url": url}, function(err, result){

            if(err) {
                return callback();
            }
            // If there's no other POIs that have this URL attached
            if(result==0){
                var lastSlash = url.lastIndexOf("/");
                var encodedUrlId = url.substring(lastSlash+1);
                var urlId = new Buffer(bs58.decode(encodedUrlId)).toString('hex');
                Url.findByIdAndRemove(urlId, function(err, result){
                    return callback();
                });
            }
            // If any other POI have this URL attached
            else{
                return callback();
            }
        });
    }

    /**
     * Takes a string of tags separated by the character
     * "#" and splits it to create an array of tags.
     */
    function tagsToArray(tags, callback){
        var tagsArray = tags.split("#");
        tagsArray.splice(0,1);
        var lowerCaserTags = [];
        tagsArray.forEach(function(tag, index){
            var temp = tag.trim();
            lowerCaserTags.push(temp.toLowerCase());

            if(index == tagsArray.length-1){
                return callback(lowerCaserTags);
            }
        });
    }

    return router;
};
