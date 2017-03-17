var mongoose = require("mongoose");

// Create instance of Schema
var mongoSchema = mongoose.Schema;

// Create Schema
var userSchema = {
	"userEmail" : String,
	"userPassword" : String
};

// Create model if not exists
module.exports = mongoose.model('userLogin', userSchema);
