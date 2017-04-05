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
};
