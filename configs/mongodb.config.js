var config = require('./app.config');
var mongoose = require('mongoose');

var connectionString = "mongodb://localhost/bioindigenous";

if (process.env.NODE_ENV == config.environments.PRODUCTION) {
    connectionString = "mongodb://indigenous:$Oxf25Ufo$@novus.modulusmongo.net:27017/H2inesux";
} else if (process.env.PAAS_HOST != null && process.env.PAAS_HOST == "modulus") {
    connectionString = "mongodb://indigenous:$Oxf25Ufo$@novus.modulusmongo.net:27017/H2inesux";
}

module.exports = {

    MONGODB_CONNECT: connectionString,

    connect: function() {
        mongoose.connect(connectionString);
    }
};


