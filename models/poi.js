var mongoose = require("mongoose");

// Create the Schema
var poiSchema = mongoose.schema({

    name: {type: String, required: true},
    description: {type: String, required: true},
    tags: {type: [String], required: true},
    lat: {type: Number, required: true},
    lng: {type: Number, required: true},
    owner: {type: String, required: true},
    fav: {type: Boolean, default: false},
    rating: {type: [Number], default: 0},
    url: {type: String, default: ""},
    image: {type:mongoose.Schema.Types.ObjectId, default: null},
    creationDate: {type: Date, default: Date.now}

});

poiSchema.methods.createResponse = function(){
    var poi = this.toJSON();
    delete poi.rating;
    delete poi.creationDate;
    return poi;
}

// Create the model if it does not exists
module.exports = mongoose.model('POI', poiSchema);
