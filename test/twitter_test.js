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

        twitterDao.getProfileForUser(this.user, function(err, value) {
            test.equal(err, null, "Error retrieving Twitter Profile");
            test.done();
        });
    },


    testGetFriendsForUser: function(test) {
        test.done();
    },


    testGetMessagesForUser: function(test) {
        test.done();
    },


    testGetPostsForUser: function(test) {
        test.done();
    }
};