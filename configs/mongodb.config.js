/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

var config = require('./app.config');

var connectionString = "mongodb://localhost/bioindigenous";
//var connectionString = "mongodb://indigenous:sLRxKmiG42sq@novus.modulusmongo.net:27017/H2inesux";

if (process.env.MONGO_CONNECT != null) {
    connectionString = process.env.MONGO_CONNECT;
}

module.exports = {
    MONGODB_CONNECT: connectionString
};


