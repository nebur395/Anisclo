var http = require("http");
var express = require('express');
var Base64 = require('./base64.js').Base64;

module.exports = function (app) {

	var router = express.Router();

    var User = app.models.User;

    /**
     * Returns all registered users of the system
     */
	router.get("/", function(req,res){
        var response = {};
        User.find({},function(err,data){
        // Mongo command to fetch all data from collection.
            if(err) {
                res.status(500);
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                res.status(200);
                response = {"error" : false,"message" : data};
            }
            res.json(response);
        });
    });


	router.post("/", function(req,res){
        var db = new User();
        var response = {};
        // fetch email and password from REST request.
        // Add strict validation when you use this in Production.
        db.userEmail = req.body.email;
 
        // Hash the password using SHA1 algorithm.
        db.userPassword =  require('crypto')
                          .createHash('sha1')
                          .update(req.body.password)
                          .digest('base64');
        db.save(function(err){
        // save() will run insert() command of MongoDB.
        // it will add new data in collection.
            if(err) {
                response = {"error" : true,"message" : "Error adding data"};
            } else {
                response = {"error" : false,"message" : "Data added"};
            }
            res.json(response);
        });
    });

    router.get("/:id", function(req,res){
        var response = {};
        User.findById(req.params.id,function(err,data){
        // This will run Mongo Query to fetch data based on ID.
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                response = {"error" : false,"message" : data};
            }
            res.json(response);
        });
    });
    router.put("/:id", function(req,res){
        var response = {};
        // first find out record exists or not
        // if it does then update the record
        User.findById(req.params.id,function(err,data){
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
            // we got data from Mongo.
            // change it accordingly.
                if(req.body.userEmail !== undefined) {
                    // case where email needs to be updated.
                    data.userEmail = req.body.userEmail;
                }
                if(req.body.userPassword !== undefined) {
                    // case where password needs to be updated
                    data.userPassword = req.body.userPassword;
                }
                // save the data
                data.save(function(err){
                    if(err) {
                        response = {"error" : true,"message" : "Error updating data"};
                    } else {
                        response = {"error" : false,"message" : "Data is updated for "+req.params.id};
                    }
                    res.json(response);
                })
            }
        });
    });
    router.delete("/:id", function(req,res){
        var response = {};
        // find the data
        User.findById(req.params.id,function(err,data){
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                // data exists, remove it.
                User.remove({_id : req.params.id},function(err){
                    if(err) {
                        response = {"error" : true,"message" : "Error deleting data"};
                    } else {
                        response = {"error" : true,"message" : "Data associated with "+req.params.id+"is deleted"};
                    }
                    res.json(response);
                });
            }
        });
    });


    /**
     * Logs the user in if it's registered.
     */

    router.get("/login", function(req, res){

        // Gets the Authorization header and retrieves and decodes the credentials.
        var auth = request.headers["Authorization"];
        var credentials = Base64.decode(auth.substring(6));
        var index = credentials.indexOf(":");
        var email = credentials.substring(0, index);
        var pass = credentials.substring(index+1);
        Console.log("Usuario: "+email+" Pass: "+pass);

        // Looks for the user
        User.findOne({email: email}, function(err, result){

            if (err){
                res.status(500).send("\"Error recuperando datos\"");
                return;
            }

            // If there's a user with that email
            if(result){

                // Hashes the password in order to compare it with the stored one
                var hashPass = require('crypto')
                    .createHash('sha1')
                    .update(pass)
                    .digest('base64');

                // If the password is correct, it sends back the user info
                if(hashPass === result.password){
                    res.status(200).send({
                        "email": result.email,
                        "name": result.name,
                        "lastname": result.lastname
                    });
                }
                // If password is wrong
                else{
                    res.status(404).send("\"Usuario o contraseña incorrectos\"");
                }
            }
            // If there's no user with that email
            else{
                res.status(404).send("\"Usuario o contraseña incorrectos\"");
            }
        });
    });

    return router;

};
