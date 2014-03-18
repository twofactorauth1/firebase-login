var app = require('../app');
var testHelpers = require('../testhelpers/testhelpers');
var testEmailConfig = require('../testhelpers/configs/test.config.js').email;
var emailDataDao = require('../dao/emaildata.dao');
var contextioDao = require('../dao/integrations/contextio.dao');

module.exports.group = {
    setUp: function(cb) {

        var self = this;
        this.emailAddress = testEmailConfig.PRIMARY_EMAIL_ADDRESS;
        this.emailPass = testEmailConfig.PRIMARY_EMAIL_PASSWORD;
        this.emailType = testEmailConfig.PRIMARY_EMAIL_TYPE;

        testHelpers.createTestUser(function(err, value) {
            if (err) {
                throw Error("Failed to setup contextio_tests");
            }
            self.user = value;
            cb();
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

    testForAccountExistence: function(test) {
        var self = this;
        console.log("TESTING ACCOUNT EXISTENCE");
        contextioDao.getContextIOAccountsByEmail(this.emailAddress, function(err, value) {
            if (err) {
                test.ok(false, "Could not retrieve ContextIO Accounts for email address: " + err.toString());
            } else {
                self.numContextIOAccounts = value.length;
                test.ok(true, self.numContextIOAccounts + " accounts exist");
            }

            test.done();
        });
    },

    testCreateAndRemoveContextIOAccount: function(test) {
        console.log("TESTING CONTEXTIO ACCOUNT CREATION");
        var self = this;

        var deferred = $.Deferred();
        var userAccount = this.user.get("accounts")[0];

        contextioDao.createContextIOAccountAndMailboxForUser(this.user, userAccount.accountId, this.emailAddress, this.emailAddress, this.emailPass, this.emailType, function(err, value) {
            if (err) {
                test.ok(false, "Failed to create ContextIO Account and Mailbox");
                deferred.reject();
            } else {
                self.contextIOAccount = value;
                test.ok(true, "Created ContextIO Account successfully");
                deferred.resolve();
            }
        });

        $.when(deferred)
            .done(function() {
                console.log("TESTING CONTEXTIO ACCOUNT REMOVAL");
                emailDataDao.removeEmailSource(self.user, self.contextIOAccount._id, function(err, value) {
                    if (err) {
                        test.ok(false, "Failed to remove ContextIO Account with id: " + self.contextIOAccount.sourceId);
                        test.done();
                    } else {
                        test.ok(true, "ContextIO Account removed successfully");
                    }
                    test.done();
                });
            })
            .fail(function() {
                test.done();
            });
    }
}