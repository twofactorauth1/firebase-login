/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var config = require('./app.config');

/*
 * Set up the connection strings for each environment.
 */
var localString = "mongodb://localhost/bioindigenous";
var testString = "mongodb://indiweb-test:testing123@kahana.mongohq.com:10074/test_indigenous";
var prodString = "mongodb://indiweb:anime1@lighthouse.0.mongolayer.com:10188,lighthouse.1.mongolayer.com:10188/prod_indigenous";

//LOCAL
var connectionString = localString;

//PROD
//var connectionString = prodString;
//TEST
//var connectionString = testString;

/*
 * Override the connection string with an environment variable
 */
if (process.env.MONGO_CONNECT != null) {
    connectionString = process.env.MONGO_CONNECT;
}

/*
 * Export the connectionstring for normal operations, and the prod/test connect string for utilities that need them.
 */
module.exports = {
    MONGODB_CONNECT: connectionString,
    PROD_MONGODB_CONNECT: prodString,
    TEST_MONGODB_CONNECT: testString
};
