var config = require('./app.config');
var mongoose = require('mongoose');

var connectionString = "mongodb://localhost/bioindigenous";

if (process.env.MONGO_CONNECT != null) {
    connectionString = process.env.MONGO_CONNECT;
}

module.exports = {

    MONGODB_CONNECT: connectionString,

    connect: function() {
        mongoose.connect(connectionString);
    }
};


