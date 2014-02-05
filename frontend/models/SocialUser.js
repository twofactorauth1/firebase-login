var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var SimpleTimestamps = require( "mongoose-SimpleTimestamps" ).SimpleTimestamps;

var authTypes = {1: 'Facebook', 2: 'Google', 3: 'Twitter'};

var schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    authType: Number,
    id: String,
    token: String,
    isActive: {type: Boolean, default: true}
});
schema.plugin(SimpleTimestamps);
module.exports = mongoose.model('SocialUser', schema);

