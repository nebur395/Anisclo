var express = require("express"),
	bodyParser = require("body-parser"),
    swaggerJSDoc = require("swagger-jsdoc");
	mongoOp = require("./models/mongo");

var app = express();
// Swagger definition
var swaggerDefinition = {
    info: {
        title: 'API de gestión de usuarios',
        version: '1.0.0',
        description: 'Descripción del API del servicio de usuarios'
    },
    host: 'localhost:3000',
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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

require('./routes')(app);

app.use('/', function(req, res) {
	console.log("Hello World");
});

// Serve swagger
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.listen(3000);
console.log("Listening to PORT 3000");

module.exports = app;
