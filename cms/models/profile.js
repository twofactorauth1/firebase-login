var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var registrationTypes = {1: 'Professional', 2: 'Business', 3: 'Enterprise'};
var businessTypes1 = {1: 'Fitness'};
var businessTypes2 = {1: 'Trainer'};

var schema = new Schema({
    registrationType: Number,
    name: String,
    businessType1: Number,
    businessType2: Number,
    size: Number
});
