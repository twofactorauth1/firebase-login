var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var schema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    id: String,
    token: String,
    email: String,
    displayName: String,
    isActive: {type: Boolean, default: true},
    addedOn: Date,
    updatedOn: Date
});
exports.Site = mongoose.model('Site', schema);

