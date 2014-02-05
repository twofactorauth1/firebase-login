var mongoose = require('mongoose');
var SimpleTimestamps = require( "mongoose-SimpleTimestamps" ).SimpleTimestamps;
var userRole = {1: 'Customer', 2: 'Client', 3: 'Backend'};

var schema = new mongoose.Schema({
    email: String,
    password: String,
    role: Number,
    isActive: {type: Boolean, default: true}
});
schema.plugin(SimpleTimestamps);
module.exports = mongoose.model('User', schema);

