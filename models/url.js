var mongoose = require("mongoose");

// Create the Schema
var urlSchema = mongoose.Schema({
    originalURL: {type: String, required: true},
    creationDate: {type: Date, default: Date.now}
});

// Create the model if it does not exists
module.exports = mongoose.model('Url', urlSchema);
