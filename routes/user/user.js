var http = require("http");
var express = require('express');

module.exports = function (app) {
	var router = express.Router();

    /**
     * @swagger
     * definition:
     *   User:
     *     properties:
     *       userEmail:
     *         type: string
     *       userPassword:
     *         type: string
     */

    /**
     * @swagger
     * /users/:
     *   get:
     *     tags:
     *       - Users
     *     description: Returns all users
     *     produces:
     *       - application/json
     *     responses:
     *       200:
     *         description: An array of users
     *         schema:
     *           $ref: '#/definitions/User'
     */
	router.get("/", function(req,res){
        var response = {};
        mongoOp.find({},function(err,data){
        // Mongo command to fetch all data from collection.
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                response = {"error" : false,"message" : data};
            }
            res.json(response);
        });
    });

    /**
     * @swagger
     * /users/:
     *   post:
     *     tags:
     *       - Users
     *     description: Creates a new user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userInfo
     *         description: User's email and password
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/User'
     *     responses:
     *       200:
     *         description: Successfully created
     */
	router.post("/", function(req,res){
        var db = new mongoOp();
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

    /**
     * @swagger
     * /users/{id}:
     *   get:
     *     tags:
     *       - Users
     *     description: Returns a single user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: User's id
     *         in: path
     *         required: true
     *         type: integer
     *     responses:
     *       200:
     *         description: A single user
     *         schema:
     *           $ref: '#/definitions/User'
     */
    router.get("/:id", function(req,res){
        var response = {};
        mongoOp.findById(req.params.id,function(err,data){
        // This will run Mongo Query to fetch data based on ID.
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                response = {"error" : false,"message" : data};
            }
            res.json(response);
        });
    });

    /**
     * @swagger
     * /users/{id}:
     *   put:
     *     tags:
     *       - Users
     *     description: Updates a single user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: Users's id
     *         in: path
     *         required: true
     *         type: integer
     *       - name: user
     *         in: body
     *         description: Fields for the User resource
     *         schema:
     *           type: array
     *           $ref: '#/definitions/User'
     *     responses:
     *       200:
     *         description: Successfully updated
     */
    router.put("/:id", function(req,res){
        var response = {};
        // first find out record exists or not
        // if it does then update the record
        mongoOp.findById(req.params.id,function(err,data){
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

    /**
     * @swagger
     * /users/{id}:
     *   delete:
     *     tags:
     *       - Users
     *     description: Deletes a single user
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: id
     *         description: Users's id
     *         in: path
     *         required: true
     *         type: integer
     *     responses:
     *       200:
     *         description: Successfully deleted
     */
    router.delete("/:id", function(req,res){
        var response = {};
        // find the data
        mongoOp.findById(req.params.id,function(err,data){
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                // data exists, remove it.
                mongoOp.remove({_id : req.params.id},function(err){
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

    return router;

};
