var mongoose = require('mongoose')
    , Schema = mongoose.Schema;
var SimpleTimestamps = require( "mongoose-simpletimestamps" ).SimpleTimestamps;

var genderType = {1: 'Male', 2: 'Female'};

var schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    site: {type: Schema.Types.ObjectId, ref: 'Site'},
    firstName: String,
    lastName: String,
    gender: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    isActive: {type: Boolean, default: true}
});

schema.plugin(SimpleTimestamps);

schema.virtual('id').get(function () {return this._id});
schema.set('toObject', { virtuals: true });
schema.set('toJSON', { virtuals: true });
module.exports = mongoose.model('Customer', schema);

