var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var SimpleTimestamps = require( "mongoose-simpletimestamps" ).SimpleTimestamps;

var schema = new Schema({
    client: {type: Schema.Types.ObjectId, ref: 'Client'},
    subDomain: String,
    isActive: {type: Boolean, default: true}
});

schema.plugin(SimpleTimestamps);
module.exports = mongoose.model('Site', schema);

