var express = require('express');
var grid = require("gridfs-stream");
var semaphore = require("semaphore")(1);
var mongoose = require("mongoose");
var fs = require("fs");
grid.mongo = mongoose.mongo;


module.exports = function (app) {

    var router = express.Router();

    var User = app.models.User;
    var POI = app.models.POI;

    /**
     * Returns a list of the existing POIs in the system.
     */
    router.get("/", function(req, res){
        
        // Sets the mongo database connection to gridfs in order to store and retrieve files in the DB.
        gfs = grid(mongoose.connection.db);

        POI.find({}, function(err, result){

            if (err){
                res.status(500).send("Error recuperando datos");
                return;
            }

            if (result.length==0){
                res.status(200).send(result);
            }

            else{
                var pois = [];
                // Iterates all the POIs stored in the system
                result.forEach(function(poi, index){

                    // Checks if there's an image attached to the POI and retrieves it if it's the case.
                    if(poi.image!=null){
                        retrieveImage(poi.image, function(data){

                            pois.push(poi.createResponse(data));

                            if(index == result.length - 1){
                                res.status(200).send({
                                    "pois": pois
                                });
                            }
                        });
                    }
                    else{
                        pois.push(poi.createResponse(""));

                        if(index == result.length - 1){
                            res.status(200).send({
                                "pois": pois
                            });
                        }
                    }
                });
            }
        });

    });

    /**
     * Creates a new POI in the system.
     */
    router.post("/", function(req, res){
        
        // Sets the mongo database connection to gridfs in order to store and retrieve files in the DB.
        gfs = grid(mongoose.connection.db);

        // Checks all body fields
        if(!req.body.userEmail || !req.body.poi){
            res.status(404).send("Usuario o POI incorrecto");
            return;
        }
        // Checks all POI fields
        if(!req.body.poi.name || !req.body.poi.description || !req.body.poi.tags ||
            !req.body.poi.lat || !req.body.poi.lng){
            res.status(404).send("Uno o más campos del POI son incorrectos");
            return;
        }

        // It searches for the user.
        User.findOne({"email": req.body.userEmail}, function(err, user){

            if(err) {
                res.status(500).send("Error recuperando datos");
                return;
            }

            // If the user exists.
            if(user){
                // Transforms all the tags to lowerCase
                arrayToLowerCase(req.body.poi.tags, function(lowerCaseTags){
                    // Creates a new POI with the basic and required info.
                    var newPoi = new POI({

                        name: req.body.poi.name,
                        description: req.body.poi.description,
                        tags: lowerCaseTags,
                        lat: req.body.poi.lat,
                        lng: req.body.poi.lng,
                        owner: req.body.userEmail
                    });

                    // Checks if there's an image attached to the POI.
                    if(req.body.poi.image){
                        // TODO: Extraer nombre y path de la request
                        var name = "imagen";
                        var path = "./image.jpg";
                        // Stores the image in the system and adds it to the POI
                        storeImage(name, path, function(imageId){
                            newPoi.image = imageId;
                            // Checks if there's an URL attached to the POI
                            if(req.body.poi.url){
                                // It shorts and stores the URL in the system and adds it to the POI
                                urlShortener(req.body.poi.url, function(shortUrl){
                                    newPoi.url = shortUrl;
                                    // Stores the POI in the system
                                    newPoi.save(function(err, result){
                                        if(err){
                                            res.status(500).send("Error guardando POI");
                                        }
                                        else{
                                            res.status(200).send("POI añadido correctamente");
                                        }
                                    });

                                });
                            }
                            // If there's no URL attached to the POI, it stores the POI in the system.
                            else{
                                newPoi.save(function(err, result){
                                    if(err){
                                        res.status(500).send("Error guardando POI");
                                    }
                                    else{
                                        res.status(200).send("POI añadido correctamente");
                                    }
                                });
                            }
                        });
                    }
                    // If there's no image attached to the POI, it checks if there's an URL attached.
                    else if(req.body.poi.url){
                        urlShortener(req.body.poi.url, function(shortUrl){
                            newPoi.url = shortUrl;
                            // Stores the POI in the system.
                            newPoi.save(function(err, result){
                                if(err){
                                    res.status(500).send("Error guardando POI");
                                }
                                else{
                                    res.status(200).send("POI añadido correctamente");
                                }
                            });

                        });
                    }
                    // If there's no image nor URL attached to the POI, it stores the POI in the system.
                    else{
                        newPoi.save(function(err, result){
                            if(err){
                                res.status(500).send("Error guardando POI");
                            }
                            else{
                                res.status(200).send("POI añadido correctamente");
                            }
                        });
                    }
                });
            }
            // If the user doesn't exists.
            else {
                res.status(404).send("El usuario no existe");
            }
        });

    });

    /**
     * Searches for every POI that match with the given tags
     * and returns them.
     */
    router.get("/filter", function(req, res){

        var tags = JSON.parse(req.headers["tags"]);

        arrayToLowerCase(tags, function(lowerCaseTags){

            // Searches for the POIs that match with the tags
            POI.find({"tags": {$in: lowerCaseTags}}, function(err, result){

                if(err) {
                    res.status(500).send("Error recuperando datos");
                    return;
                }

                // If no POI match with the tags, it returns an empty array
                if (result.length==0){
                    res.status(200).send(result);
                }
                else{
                    var pois = [];
                    // Iterates all the POIs that match with the tags
                    result.forEach(function(poi, index){

                        // Checks if there's an image attached to the POI and retrieves it if it's the case.
                        if(poi.image!=null){
                            retrieveImage(poi.image, function(data){

                                pois.push(poi.createResponse(data));

                                if(index == result.length - 1){
                                    res.status(200).send({
                                        "pois": pois
                                    });
                                }
                            });
                        }
                        else{
                            pois.push(poi.createResponse(""));

                            if(index == result.length - 1){
                                res.status(200).send({
                                    "pois": pois
                                });
                            }
                        }
                    });
                }

            });
        });
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
     * Duplicates the desired POI and saves it
     * in the account with email [userEmail].
     */
    router.post("/:id", function(req, res){

        // Checks all body fields
        if(!req.body.userEmail){
            res.status(404).send("Usuario incorrecto");
            return;
        }

        // It searches for the user which will have the duplicate.
        User.findOne({"email": req.body.userEmail}, function(err, user){

            if(err) {
                res.status(500).send("Error recuperando datos");
                return;
            }

            // If the user exists.
            if(user){

                // Checks if the POI that is going to be duplicated exists.
                POI.findById(req.params.id, function(err, poi){

                    if(err) {
                        res.status(500).send("Error recuperando datos");
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

                        // Creates the POI model objetc and saves it.
                        var duplicatedPoi = new POI(duplicate);
                        duplicatedPoi.save(function(err, result){
                            if(err){
                                res.status(500).send("Error guardando POI");
                            }
                            else{
                                res.status(200).send("POI duplicado correctamente");
                            }
                        });
                    }
                    // If the POI doesn't exists.
                    else{
                        res.status(404).send("El POI no existe");
                    }
                })

            }
            // If the user doesn't exists.
            else{
                res.status(404).send("El usuario no existe");
            }
        });

    });

    /**
     * Removes the desired POI from the system,
     * including the attached image and URL, if any.
     */
    router.delete("/:id", function(req, res){

        gfs = grid(mongoose.connection.db);

        // Checks all body fields
        if(!req.body.userEmail){
            res.status(404).send("Usuario incorrecto");
            return;
        }

        // Checks if the user exists
        User.findOne({"email": req.body.userEmail}, function(err, user){

            if(err) {
                res.status(500).send("Error recuperando datos");
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
                            res.status(500).send("Error recuperando y eliminando datos");
                            return;
                        }

                        // If the POI doesn't exists.
                        if(result===null){
                            semaphore.leave();
                            res.status(404).send("El POI no existe");
                        }
                        // If the POI exists and it's been removed
                        else{
                            // It calls a function that removes the image and url attached to the POI, if any
                            removeUrlAndImage(result, function(){
                                semaphore.leave();
                                res.status(200).send("POI eliminado correctamente");
                            });
                        }
                    });
                });
            }
            // If the user doesn't exists.
            else{
                res.status(404).send("El usuario no existe");
            }
        });
    });

    /**
     * Updates an existing POI with new information.
     */
    router.put("/:id", function(req, res){

        // Checks all body fields
        if(!req.body.userEmail || !req.body.poi){
            res.status(404).send("Usuario o POI incorrecto");
            return;
        }
        // Checks all POI fields
        if(!req.body.poi.name || !req.body.poi.description || !req.body.poi.tags ||
            !req.body.poi.lat || !req.body.poi.lng){
            res.status(404).send("Uno o más campos del POI son incorrectos");
            return;
        }

        // Checks if the user exists
        User.findOne({"email": req.body.userEmail}, function(err, user){

            if(err) {
                res.status(500).send("Error recuperando datos");
                return;
            }

            // If the user exists
            if(user){
                // Searches for the POI with the given ID and user
                POI.findOne({"_id":req.params.id, "owner":req.body.userEmail}, function(err, poi){

                    if(err) {
                        res.status(500).send("Error recuperando datos");
                        return;
                    }

                    // If the POI with that ID and user exists
                    if(poi){

                        // Updates every modifiable field in the POI
                        poi.name = req.body.poi.name;
                        poi.description = req.body.poi.description;
                        poi.tags = req.body.poi.tags;
                        poi.lat = req.body.poi.lat;
                        poi.lng = req.body.poi.lng;

                        // Checks if the request have a new URL for the POI, since it's an optional field
                        if(req.body.poi.url){
                            poi.url = req.body.poi.url;
                        }

                        // Saves the POI with the new info
                        poi.save(function(err, result){

                            if(err) {
                                res.status(500).send("Error actualizando POI");
                            }
                            else{
                                res.status(200).send("POI actualizado correctamente");
                            }
                        });
                    }
                    // If the POI with that ID and user doesn't exists
                    else{
                        res.status(404).send("El POI no existe");
                    }
                });
            }
            // If the user doesn't exists.
            else{
                res.status(404).send("El usuario no existe");
            }

        });

    });

    /**
     *  Stores a new image in the system.
     */
    function storeImage(name, path, callback){
        var writestream = gfs.createWriteStream({
            filename: name
        });
        fs.createReadStream(path).pipe(writestream);
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
            return callback(buffer.toString('base64'));
        });
    }

    /**
     *  URL shortener. Right now is just a stub.
     */
    function urlShortener(url, callback){
        return callback(url);
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
                //TODO: borrar la URL de su colección
                return callback();
            }
            // If any other POI have this URL attached
            else{
                return callback();
            }
        });
    }

    function arrayToLowerCase(array, callback){
        var newArray = [];
        array.forEach(function(tag, index){
            newArray.push(tag.toLowerCase());

            if(index == array.length-1){
                return callback(newArray);
            }
        });
    }

    return router;
};
