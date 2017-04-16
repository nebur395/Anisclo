var express = require("express"),
	bodyParser = require("body-parser"),
    mongoose = require('mongoose'),
    swaggerJSDoc = require("swagger-jsdoc"),
    crypto = require("crypto"),
    fs = require("fs"),
    https = require("https");


var app = express();

// swagger definition
var swaggerDefinition = {
    info: {
        title: 'Añisclo API ',
        version: '1.0.0',
        description: 'Descripción de la API pública del Team Añisclo'
    },
    host: 'localhost:8080',
    basePath: '/'
};

// options for the swagger docs
var options = {
    // import swaggerDefinitions
    swaggerDefinition: swaggerDefinition,
    // path to the API docs
    apis: ['./routes/user/*.js', './routes/poi/*.js',
        './models/user.js', './models/poi.js', './models/route.js']
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

app.use(express.static('./public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

// serve swagger
app.get('/swagger.json', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

app.models = require('./models');

require('./routes')(app);

app.use('/', function(req, res) {
	console.log("Bienvenido");
});

// Creation of https connection
var privateKey = fs.readFileSync('localhost.key','utf8');
var certificate = fs.readFileSync('localhost.crt','utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials,app);


// Database connection and server launching

var dbUri = 'mongodb://localhost:27017/aniscloDb';
mongoose.connect(dbUri);
mongoose.connection.once('open', function(){

    console.log("MongoDB connection created in "+dbUri);

    app.listen(8080, function(){
        console.log("Server listening to PORT 8080");
    });
    //HTTPS server launch (compatible with http at the same time)
    httpsServer.listen(8443,function () {
        console.log("Secure server listening to PORT 8443");
    });

});

module.exports = app;
