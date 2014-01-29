var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    domain: String,
    addedOn: Date,
    updatedOn: Date
});
exports.Site = mongoose.model('Site', schema);

