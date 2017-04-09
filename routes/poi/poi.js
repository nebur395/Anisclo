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

                // Creates a new POI with the basic and required info.
                var newPoi = new POI({

                    name: req.body.poi.name,
                    description: req.body.poi.description,
                    tags: req.body.poi.tags,
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
            }
            // If the user doesn't exists.
            else {
                res.status(404).send("El usuario no existe");
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
                        delete duplicate.fav;
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

    return router;
};
