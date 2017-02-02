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
var localString = "mongodb://localhost/local_indigenous";
//var testString = "mongodb://indiweb-test2016:testing456@ds127949.mlab.com:27949/test_indigenous";
var testString = "mongodb://indiweb-test2016:testing456@ds139559-a0.mlab.com:39559,ds139559-a1.mlab.com:39559/test_indigenous?replicaSet=rs-ds139559";
var testSingleHostString = "mongodb://indiweb-test2016:testing456@ds139559-a0.mlab.com:39559/test_indigenous";
//var prodString = "mongodb://indiapp2:Ind1genous2016!@lighthouse.1.mongolayer.com:10188,lighthouse.0.mongolayer.com:10188/prod_indigenous?replicaSet=set-53f6b4cc19627093350038e8";
//var prodString = "mongodb://indiapp2:Ind1genous2016!@lighthouse.6.mongolayer.com:10007,lighthouse.7.mongolayer.com:10007/prod_indigenous?replicaSet=set-582c8c97304fb61ff6000632";
var prodString = "mongodb://indiapp2:Ind1genous2016!@ds139559-a0.mlab.com:39559,ds139559-a1.mlab.com:39559/prod_indigenous?replicaSet=rs-ds139559";
var prodSingleHostString = "mongodb://indiapp2:Ind1genous2016!@ds139559-a0.mlab.com:39559/prod_indigenous";

//LOCAL
//var connectionString = localString;

//PROD
//var connectionString = prodString;

//TEST
var connectionString = testString;
var singleHostString = testSingleHostString;

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
if(process.env.MONGO_SINGLE_HOST != null) {
    singleHostString = process.env.MONGO_SINGLE_HOST;
}

/*
 * Export the connectionstring for normal operations, and the prod/test connect string for utilities that need them.
 */
module.exports = {
    MONGODB_CONNECT: connectionString,
    MONGODB_SINGLE_HOST: singleHostString,
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
