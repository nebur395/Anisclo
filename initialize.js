var mongoose = require('mongoose');
var express = require('express');
var models = require('./models');
var crypto = require('crypto');


var app = express();

var dbUri = 'mongodb://localhost:27017/aniscloDb';

var User = models.User;

mongoose.connect(dbUri);
mongoose.connection.once('open', function(){

    console.log("MongoDB connection created in "+dbUri);

    var hashPass = require('crypto')
        .createHash('sha1')
        .update('pass')
        .digest('base64');


    User.create({
        email: "master@admin.com",
        password: hashPass,
        name: "Dungeon",
        lastname: "Master",
        admin: true,
        firstLogin: false
    }, function(err, result){
        if(err){
            console.log("Error creando el usuario administrador en el sistema.")
        }
        else{
            console.log("Nuevo usuario administrador creado en el sistema.");
        }
        mongoose.connection.close();
    });



});
