var mongoose = require("mongoose");

mongoose.Promise = global.Promise;
// Create the Schema
var poiSchema = mongoose.Schema({

    name: {type: String, required: true},
    description: {type: String, required: true},
    tags: {type: [String], required: true},
    lat: {type: Number, required: true},
    lng: {type: Number, required: true},
    owner: {type: String, required: true},
    fav: {type: Boolean, default: false},
    rating: {type: [Number], default: []},
    url: {type: String, default: ""},
    image: {type:mongoose.Schema.Types.ObjectId, default: null},
    creationDate: {type: Date, default: Date.now}

});

poiSchema.methods.createResponse = function(imageData){
    var poi = this.toJSON();
    delete poi.rating;
    delete poi.creationDate;
    delete poi.__v;
    poi.image = imageData;
    return poi;
};

// Create the model if it does not exists
module.exports = mongoose.model('POI', poiSchema);
