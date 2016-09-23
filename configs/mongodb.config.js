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
var localString = "mongodb://localhost/test_indigenous";
var testString = "mongodb://indiweb-test:testing123@lighthouse.1.mongolayer.com:10303,lighthouse.0.mongolayer.com:10303/test_indigenous?replicaSet=set-54f7c735c346b1d3bf0005b0";
var prodString = "mongodb://indiapp:1ndigenous2015!@lighthouse.1.mongolayer.com:10188/prod_indigenous";

//LOCAL
//var connectionString = localString;

//PROD
//var connectionString = prodString;
//TEST
var connectionString = testString;
var testHost = 'lighthouse.1.mongolayer.com';
var testPort = '10303';
var testUsername = 'indiweb-test';
var testPassword = 'testing123';

var prodHost = 'lighthouse.0.mongolayer.com';
var prodPort = '10188';
var prodUsername = 'indiapp';
var prodPassword = '1ndigenous2015!';

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
    TEST_MONGODB_CONNECT: testString,
    TEST_HOST: testHost,
    TEST_PORT: testPort,
    TEST_USER: testUsername,
    TEST_PASS: testPassword,
    PROD_HOST: prodHost,
    PROD_PORT: prodPort,
    PROD_USER: prodUsername,
    PROD_PASS: prodPassword
};
