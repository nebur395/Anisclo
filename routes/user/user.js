var http = require("http");
var express = require('express');
var base64 = require('base-64');
var utf8 = require('utf8');

module.exports = function (app) {

	var router = express.Router();

    var User = app.models.User;

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

    /**
     * Creates a new user in the system
     */
	router.post("/", function(req,res){

        // Checks all body fields
        if(!req.body.name || !req.body.lastname || !req.body.email){
            res.status(404).send("\"Nombre, apellido o email incorrectos\"");
            return;
        }

        var hashPass = require('crypto')
            .createHash('sha1')
            .update("pass")
            .digest('base64');

        console.log("Nombre: "+req.body.name+" Apellido: "+req.body.lastname+" Email: "+req.body.email);
        User.create({

            email: req.body.email,
            password: hashPass,
            name: req.body.name,
            lastname: req.body.lastname,
            admin: false

        }, function (err, result){

            if(err){
                res.status(500).send("\"Error guardando datos\"");
            }
            else{
                res.status(200).send("\"Usuario creado correctamente\"");
            }
        });
    });


    /**
     * Logs the user in if it's registered.
     */
    router.get("/login", function(req, res){

        // Gets the Authorization header and retrieves and decodes the credentials.
        var auth = req.headers["authorization"];
        var bytes = base64.decode(auth.substring(6));
        var credentials = utf8.decode(bytes);
        var index = credentials.indexOf(":");
        var email = credentials.substring(0, index);
        var pass = credentials.substring(index+1);
        console.log("Usuario: "+email+" Pass: "+pass);

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
                    console.log("Contraseña incorrecta");
                    res.status(404).send("\"Email o contraseña incorrectos\"");
                }
            }
            // If there's no user with that email
            else{
                console.log("No usuario");
                res.status(404).send("\"Email o contraseña incorrectos\"");
            }
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
    router.get("/:email", function(req,res){
        User.findOne({email: req.params.email},function(err,data){
            if(err) {
                res.status(500).send("\"Error recuperando datos\"");
            }
            else {
                res.status(200).send(data);
            }
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
    router.put("/:email", function(req,res){

        if(!req.body.pass){
            res.status(404).send("\"Contraseña incorrecta\"");
            return;
        }

        var hashPass = require('crypto')
            .createHash('sha1')
            .update(req.body.pass)
            .digest('base64');

        User.findOneAndUpdate({email: req.params.email}, {password:hashPass},function(err,data){
            if(err) {
                res.status(500).send("\"Error borrando usuario\"");
                return;
            }

            if(data===null){
                res.status(404).send("\"El usuario no existe\"");
            }
            else{
                res.status(200).send("\"Usuario actualizado correctamente\"");
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

    /**
     * Removes the user with the corresponding email from the system
     */
    router.delete("/:email", function(req,res){
        console.log("Email: "+req.params.email);

        User.remove({email: req.params.email},function(err,result){
            if(err) {
                res.status(500).send("\"Error borrando usuario\"");
                return;
            }
            // If there's no user with that email
            if(result.result.n === 0){
                res.status(404).send("\"El usuario que desea borrar no existe\"");
            }
            // If the user is found and successfully removed
            else{
                res.status(200).send("\"Usuario eliminado correctamente\"");
            }
        });
    });

    return router;

};
