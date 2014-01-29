var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    email: String,
    password: String,
    isActive: {type: Boolean, default: true},
    addedOn: Date,
    updatedOn: Date
});
exports.User = mongoose.model('User', schema);

