var express = require("express"),
	bodyParser = require("body-parser"),
    mongoose = require('mongoose'),
    swaggerJSDoc = require("swagger-jsdoc"),
    crypto = require("crypto"),
    fs = require("fs"),
    morgan = require("morgan"),
    config = require("./config"),
    jwt = require("express-jwt"),
    https = require("https");
require('body-parser-xml')(bodyParser);


var app = express();

// Morgan used to log requests to the console in developer's mode
app.use(morgan('dev'));

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
    apis: ['./routes/user/*.js', './routes/poi/*.js', './routes/url/*.js', './routes/stats/*.js',
        './routes/admin/*.js', './models/user.js', './models/poi.js', './models/route.js']
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);

// Secret key used to sign JWT
app.set('secret', config.secret);

app.use(express.static('./public'));

// Middleware to access handler and JWT
require('./security/jwt-handler')(app);


app.use(bodyParser.json({limit: '20mb'}));
app.use(bodyParser.urlencoded({limit: '20mb', extended : true}));
app.use(bodyParser.xml());

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
