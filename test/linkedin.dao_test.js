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
var facebookDao = require('../dao/social/facebook.dao');
var linkedInDao = require('../dao/social/linkedin.dao');


module.exports.group = {
    setUp: function(cb) {

        var self = this;

        testHelpers.createTestUser(function(err, value) {
            if (err) {
                throw Error("Failed to setup contextio_tests");
            }
            self.user = value;

            var config = testConfig.linkedIn;
            self.user.createOrUpdateSocialCredentials($$.constants.social.types.LINKEDIN,
                null,
                config.accessToken,
                null,
                null,
                null,
                null,
                null);

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


    testShareLink: function(test) {
        var self = this;

        linkedInDao.shareLink(this.user, 'http://www.indigenous.io', 'https://s3.amazonaws.com/indigenous-account-websites/acct_6/logo.png', 'Indig-name', 'Indig-caption', 'Indig-description', function(err, value){
            if(err) {
                test.ok(false, 'Error sharing link: ' + err);
                return test.done();
            }
            console.dir(value);
            test.ok(true);
            test.done();
        });

    }
};

