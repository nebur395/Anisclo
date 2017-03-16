var express = require("express"),
	bodyParser = require("body-parser"),
	mongoOp = require(".models/mongo");

var app = express();


app.use(express.static('./public'));

require('./routes')(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));

app.use('/', function(req, res) {
	console.log("Hello World");
});

app.listen(3000);
console.log("Listening to PORT 3000");