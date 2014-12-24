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
var facebookDao = require('../dao/social/facebook.dao');

module.exports.group = {
    setUp: function(cb) {

        var self = this;

        testHelpers.createTestUser(function(err, value) {
            if (err) {
                throw Error("Failed to setup contextio_tests");
            }
            self.user = value;

            var config = testConfig.facebook2;
            self.user.createOrUpdateSocialCredentials($$.constants.social.types.FACEBOOK,
                config.facebookId,
                config.accessToken,
                null,
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


    testGetFriendsForUser: function(test) {
        var self = this;
        console.log("TESTING RETRIEVE FACEBOOK FRIENDS");
        facebookDao.getFriendsForUser(this.user, function(err, value) {
            if (err) {
                test.ok(false, "Error occurred retrieving facebook friends: " + JSON.stringify(err));
                return test.done();
            }

            if (value.data.length > 0) {
                test.ok(true, "Facebook friends retrieved successfully");
            } else {
                test.ok(false, "Failed to retrieve any facebook friends");
            }
            test.done();
        });
    },

/*
    testGetMessagesForUser: function(test) {
        var self = this;
        console.log("TESTING MESSAGES FOR FRIEND");
        facebookDao.getMessagesWithFriend(this.user, testConfig.facebook.friendId, function(err, value) {
            if (err) {
                test.ok(false, "Error occurred retrieving Facebook messages: " + JSON.stringify(err));
                return test.done();
            }

            if (value.length > 0) {
                test.ok(true, "Facebook messages retrieved");
                var objWithNoName = _.findWhere(value, {name:null});

                test.equal(objWithNoName, null, "All messages have an author supplied");
            } else {
                test.ok(false, "Failed to retrieve any facebook messages");
            }
            test.done();
        });
    },


    testGetPostsForUser: function(test) {
        var self = this;
        console.log("TESTING POSTS FOR FRIEND");
        facebookDao.getUserPosts(this.user, testConfig.facebook.friendId, function(err, value) {
            if (err) {
                test.ok(false, "Error occurred retrieving posts for friend: " + JSON.stringify(err));
                return test.done();
            }

            test.notEqual(value.length, 0, "Posts returned for user");
            test.done();
        });
    },
*/
    testShareLink: function(test) {
        var self = this;
        facebookDao.shareLink(this.user, 'http://www.indigenous.io', 'https://s3.amazonaws.com/indigenous-account-websites/acct_6/logo.png', 'Indig-name', 'Indig-caption', 'Indig-description', function(err, value){
            if(err) {
                test.ok(false, 'Error sharing link: ' + err);
                return test.done();
            }
            test.ok(true);
            test.done();
        });
    }
};