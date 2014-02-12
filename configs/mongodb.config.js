var config = require('./app.config');
var mongoose = require('mongoose');

var connectionString = "";
if (process.env.NODE_ENV == config.environments.PRODUCTION) {
    connectionString = "mongodb://indigenous:$Oxf25Ufo$@novus.modulusmongo.net:27017/H2inesux";
} else {
    connectionString = "mongodb://localhost/bioindigenous";
}

module.exports = {

    MONGODB_CONNECT: connectionString,

    connect: function() {
        mongoose.connect(connectionString);
    }
};


