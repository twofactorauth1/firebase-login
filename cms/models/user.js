var mongoose = require('mongoose');

var schema = new mongoose.Schema({
        email: String,
        password: String,
        isActive: Boolean
});
exports.User = mongoose.model('User', schema);

