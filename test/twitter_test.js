/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var app = require('../app');
var testHelpers = require('../testhelpers/testhelpers');
var testConfig = require('../testhelpers/configs/test.config.js');
var userDao = require('../dao/user.dao');
var twitterDao = require('../dao/social/twitter.dao');

module.exports.group = {
    setUp: function(cb) {

        var self = this;

        testHelpers.createTestUser(function(err, value) {
            if (err) {
                throw Error("Failed to setup contextio_tests");
            }
            self.user = value;

            var config = testConfig.twitter;
            self.user.createOrUpdateSocialCredentials($$.constants.social.types.TWITTER,
                config.twitterId,
                config.accessToken,
                config.accessTokenSecret,
                config.tokenExpires,
                config.username,
                null,
                config.tokenScope);

            userDao.saveOrUpdate(self.user, function(err, value) {
                cb();
            });
        });
    },


    tearDown: function(cb) {
        var self = this;
        testHelpers.destroyTestUser(this.user, function(err, value) {
            if (err) {
                throw Error("Failed to tearDown contextio_tests");
            }
            self.user = null;

            cb();
        });
    },


    testGetProfileForUser: function(test) {
        console.log("TESTING TWITTER RETRIEVE PROFILE");

        var self = this;
        twitterDao.refreshUserFromProfile(this.user, true, function(err, value) {
            if (err) {
                test.ok(false, "Error retrieving twitter profile: " + err.toString());
                test.done();
            }

            var details = self.user.getDetails($$.constants.social.types.TWITTER);
            if (details == null) {
                test.ok(false, "Error retrieving user Details for Twitter profile");
                return test.done();
            }

            test.equal(details.username, testConfig.twitter.username, "Twitter username is set properly");
            test.done();
        });
    },


    testGetTweetsForUser: function(test) {
        console.log("TESTING RETRIEVE TWEETS FOR USER");
        var self = this;

        twitterDao.getTweetsForUser(this.user, function(err, value) {
            if (err) {
                test.ok(false, "Error retrieving tweets for user.");
                return test.done()
            }

            test.notEqual(value.length, 0, "Tweets retrieved");
            test.done();
        });
    }
};