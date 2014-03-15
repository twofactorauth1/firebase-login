var app = require('../app');
var testHelpers = require('../testhelpers/testhelpers');
var emailDataDao = require('../dao/emaildata.dao');

module.exports.group = {
    setUp: function(cb) {

        console.log("SETTING UP");
        var self = this;
        this.emailAddress = "hostedlcr@gmail.com";
        this.emailPass = "JmiiooGWHWIU";
        this.emailType = "gmail";

        testHelpers.createTestUser(function(err, value) {
            if (err) {
                throw Error("Failed to setup contextio_tests");
            }
            self.user = value;
            cb();
        });
    },

    tearDown: function(cb) {
        console.log("TEARING DOWN");
        var self = this;
        testHelpers.destroyTestUser(this.user, function(err, value) {
            if (err) {
                throw Error("Failed to tearDown contextio_tests");
            }
            self.user = null;

            //testHelpers.shutDown();
            cb();
        });
    },

    testForAccountExistence: function(test) {
        console.log("TESTING ACCOUNT EXISTENCE");
        emailDataDao.getContextIOAccountByEmail(this.emailAddress, function(err, value) {
            test.equal(value.length, 0, "Expecting no ContextIO accounts");
            test.done();
        });
    },

    testCreateContextIOAccount: function(test) {
        console.log("CREATING CONTEXTIO ACCOUNT");
        var self = this;
        emailDataDao.createContextIOAccountAndMailboxForUser(this.user, null, this.emailAddress, this.emailAddress, this.emailPass, this.emailType, function(err, value) {
            if (err) {
               test.ok(false, "Failed to create ContextIO Account and Mailbox");
            } else {
                self.contextIOAccount = value;
                test.ok(true);
            }

            test.done();
        });
    },

    testRemoveContextIOAccount: function(test) {
        console.log("REMOVING CONTEXTIO ACCOUNT");
        emailDataDao.removeContextIOAccount(this.contextIOAccount.id);
        test.done();
        testHelpers.shutDown();
    }
}