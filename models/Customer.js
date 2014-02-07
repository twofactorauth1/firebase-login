var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var SimpleTimestamps = require( "mongoose-SimpleTimestamps" ).SimpleTimestamps;

var schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    site: {type: Schema.Types.ObjectId, ref: 'Site'},
    isActive: {type: Boolean, default: true}
});

schema.plugin(SimpleTimestamps);
module.exports = mongoose.model('Customer', schema);

