/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var config = require('./app.config');

var connectionString = "mongodb://localhost/bioindigenous";
//var connectionString = "mongodb://indigenous:sLRxKmiG42sq@novus.modulusmongo.net:27017/H2inesux";
//var connectionString = "mongodb://indigenous:33e90274a9d44740f26e3c70341aebce@kahana.mongohq.com:10077/indigenous”;

if (process.env.MONGO_CONNECT != null) {
    connectionString = process.env.MONGO_CONNECT;
}

module.exports = {
    MONGODB_CONNECT: connectionString
};


