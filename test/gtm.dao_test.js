/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

process.env.NODE_ENV = "testing";
var app = require('../app');
var testHelpers = require('../testhelpers/testhelpers');
var testConfig = require('../testhelpers/configs/test.config.js');
var userDao = require('../dao/user.dao');
var gtmDao = require('../dao/social/gtm.dao');

module.exports.group = {
    setUp: function(cb) {
        cb();

    },

    tearDown: function(cb) {
        cb();
    },

    testAddRegistrant: function(test) {
        test.expect(1);
        var organizerId = "3769601213311530245";
        var webinarId = "64208544799841548";
        var resendConfirmation = true;
        var accessToken = "rGbgknavGoHhvFt6rU9KseXQTXK8";
        var registrantInfo = {
            "firstName": "Kyle",
            "lastName": "Miller",
            "email": "millkyl+testing@gmail.com"
        };

        gtmDao.addRegistrant(organizerId, webinarId, resendConfirmation, accessToken, registrantInfo, function(err, value){
            if(err) {
                test.ok(false, 'Error in testing: ' + err);
                test.done();
            } else {
                test.ok(true, 'Received response: ' + value);
                test.done();
            }
        });
    }

};