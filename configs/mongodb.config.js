/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var config = require('./app.config');

//LOCAL
var connectionString = "mongodb://localhost/bioindigenous";

//PROD
//var connectionString = "mongodb://indiweb:anime1@kahana.mongohq.com:10077/indigenous";
//TEST
var connectionString = "mongodb://indiweb-test:testing123@kahana.mongohq.com:10074/test_indigenous";

if (process.env.MONGO_CONNECT != null) {
    connectionString = process.env.MONGO_CONNECT;
}

module.exports = {
    MONGODB_CONNECT: connectionString
};
