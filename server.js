var express = require("express"),
	bodyParser = require("body-parser"),
    mongoose = require('mongoose');

var app = express();


app.use(express.static('./public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

app.models = require('./models');

require('./routes')(app);

app.use('/', function(req, res) {
	console.log("Bienvenido");
});

// Database connection and server launching
var dbUri = 'mongodb://localhost:27017/demoDb';
mongoose.connect(dbUri);
mongoose.connection.once('open', function(){

    console.log("MongoDB connection created in "+dbUri);
    app.listen(3000, function(){
        console.log("Server listening to PORT 3000");
    });

});


module.exports = app;
