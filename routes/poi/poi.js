var express = require('express');

module.exports = function (app) {

    var router = express.Router();

    var User = app.models.User;
    var POI = app.models.POI;


    /**
     * Returns a list of the existing POIs in the system.
     */
    router.get("/", function(req, res){

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
                result.forEach(function(poi, index){

                    pois.push(poi.createResponse());

                    if(index == result.length - 1){
                        res.status(200).send({
                            "pois": pois
                        });
                    }
                });
            }
        });

    });


    router.post("/", function(req, res){

        // Checks all body fields
        if(!req.body.userID || !req.body.poi){
            res.status(404).send("Usuario o POI incorrecto");
            return;
        }
        // Checks all POI fields
        if(!req.body.poi.name || !req.body.poi.description || !req.body.poi.tags ||
            !req.body.poi.lat || !req.body.poi.lng){
            res.status(404).send("Uno o más campos del POI son incorrectos");
            return;
        }

        User.findOne({"email": req.body.userID}, function(err, user){

            if(err) {
                res.status(500).send("Error recuperando datos");
                return;
            }

            if(user){

                POI.create({

                    name: req.body.poi.name,
                    description: req.body.poi.description,
                    tags: req.body.poi.tags,
                    lat: req.body.poi.lat,
                    lng: req.body.poi.lng,
                    owner: req.body.userID,
                    url: req.body.poi.url ? req.body.poi.url : ""


                }, function (err, result){

                    if(err){
                        res.status(500).send("Error guardando datos");
                    }

                    else{
                        res.status(200).send("POI añadido correctamente");
                    }
                });

            }
            else {
                res.status(404).send("El usuario no existe");
            }
        });

    });

    return router;
};
