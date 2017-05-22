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
var testString = "mongodb://indiweb-test2016:testing456@ds139559-a0.mlab.com:39559,ds139559-a1.mlab.com:39559/test_indigenous?replicaSet=rs-ds139559&connectTimeoutMS=60000&socketTimeoutMS=60000";
var testSingleHostString = "mongodb://indiweb-test2016:testing456@ds139559-a0.mlab.com:39559/test_indigenous";
//var prodString = "mongodb://indiapp2:Ind1genous2016!@lighthouse.1.mongolayer.com:10188,lighthouse.0.mongolayer.com:10188/prod_indigenous?replicaSet=set-53f6b4cc19627093350038e8";
//var prodString = "mongodb://indiapp2:Ind1genous2016!@lighthouse.6.mongolayer.com:10007,lighthouse.7.mongolayer.com:10007/prod_indigenous?replicaSet=set-582c8c97304fb61ff6000632";
var prodString = "mongodb://indiapp2:Ind1genous2016!@ds139559-a0.mlab.com:39559,ds139559-a1.mlab.com:39559/prod_indigenous?replicaSet=rs-ds139559&connectTimeoutMS=60000&socketTimeoutMS=60000";
var prodSingleHostString = "mongodb://indiapp2:Ind1genous2016!@ds139559-a0.mlab.com:39559/prod_indigenous";

//LOCAL
//var connectionString = localString;

//PROD
//var connectionString = prodString;
//var singleHostString = prodSingleHostString;

//TEST
var connectionString = testString;
var singleHostString = testSingleHostString;

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
};
