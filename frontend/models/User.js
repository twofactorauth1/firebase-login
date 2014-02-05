var mongoose = require('mongoose');
var SimpleTimestamps = require( "mongoose-SimpleTimestamps" ).SimpleTimestamps;

var schema = new mongoose.Schema({
    email: String,
    password: String,
    isActive: {type: Boolean, default: true}
});
schema.plugin(SimpleTimestamps);
module.exports = mongoose.model('User', schema);

