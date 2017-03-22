var express = require("express"),
	bodyParser = require("body-parser"),
    mongoose = require('mongoose'),
    swaggerJSDoc = require("swagger-jsdoc");


var app = express();
// Swagger definition
var swaggerDefinition = {
    info: {
        title: 'API de gestión de usuarios',
        version: '1.0.0',
        description: 'Descripción del API del servicio de usuarios'
    },
    host: 'localhost:8080',
    basePath: '/'
};

// Options for the swagger docs
var options = {
  // Import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // Path to the API docs
    apis: ['*.js']
};

// Initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

app.use(express.static('./public'));
app.use(express.static('./public-swagger'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.models = require('./models');

require('./routes')(app);

app.use('/', function(req, res) {
	console.log("Bienvenido");
});

// Serve swagger
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Database connection and server launching
var dbUri = 'mongodb://localhost:27017/aniscloDb';
mongoose.connect(dbUri);
mongoose.connection.once('open', function(){

    console.log("MongoDB connection created in "+dbUri);
    app.listen(8080, function(){
        console.log("Server listening to PORT 8080");
    });

});

module.exports = app;
