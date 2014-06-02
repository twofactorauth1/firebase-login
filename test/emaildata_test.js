/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

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
                throw Error("Failed to setup test");
            }
            self.user = value;
            self.accountId = self.user.get("accounts")[0].accountId;
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


    testCreateAndRemoveEmailSource: function(test) {
        console.log("TESTING EMAIL SOURCE CREATION");
        var self = this;

        var deferred = $.Deferred();
        var deferred2 = $.Deferred();

        emailDataDao.createEmailSource(this.user, this.accountId, this.emailAddress, this.emailAddress, this.emailPass, this.emailType, function(err, value) {
            if (err) {
                test.ok(false, "Failed to create Email Source Account and Mailbox");
                deferred.reject();
            } else {
                self.emailSource = value;
                test.ok(true, "Created EmailSource successfully");

                //Test to see if we can retrieve it back:
                emailDataDao.getEmailSources(self.user, self.accountId, function(err, value) {
                    if (err) {
                        test.ok(false, "Could not retrieve Email Sources for Test user");
                        return deferred.reject();
                    }

                    test.equal(value.length, 1, "Email Sources for User has length of 1")
                    deferred.resolve();
                });
            }
        });

        $.when(deferred)
            .done(function() {
                console.log("TESTING RETRIEVAL OF MESSAGES FOR EMAIL");

                //Set timeout, otherwise ContextIO doesn't have enough time to index messages and a result with length 0 is returned.
                setTimeout(function() {
                    var options = {
                        email: testEmailConfig.PRIMARY_EMAIL_PARTNER,
                        limit: 2
                    };
                    emailDataDao.getMessages(self.user, self.accountId, self.emailSource._id, options, function(err, value) {
                        if (err) {
                            test.ok(false, "Could not retrieve messages for email");
                            return deferred2.resolve();
                        }
                        console.log("MESSAGES RETRIEVED: " + value.data.length);
                        if (value.data.length > 0) {
                            test.equal(value.data.length, 2, "Single email message retrieved");
                            test.ok(true, "Retrieved one or more messages for email");

                            console.log("TESTING RETRIEVAL OF MESSAGE DETAILS");
                            var messageId = value.data[0].message_id;
                            var sourceId = value.source._id;
                            emailDataDao.getMessageById(self.user, self.accountId, sourceId, messageId, function(err, value) {
                                if (err) {
                                    test.ok(false, "Could not retrieve message details");
                                    return deferred2.resolve();
                                }

                                test.ok(true, "Retrieved message details");
                                return deferred2.resolve();
                            });
                        } else {
                            test.ok(false, "No messages retrieved for email");
                            return deferred2.resolve();
                        }
                    });
                }, 2000);
            })
            .fail(function() {
                test.done();
            });


        $.when(deferred2)
            .done(function() {
                console.log("TESTING EMAIL SOURCE REMOVAL");
                emailDataDao.removeEmailSource(self.user, self.emailSource._id, function(err, value) {
                    if (err) {
                        test.ok(false, "Failed to remove Email Source with id: " + self.emailSource.providerId);
                        return test.done();
                    }

                    test.ok(true, "EmailSource removed successfully");
                    test.done();
                });
            })
            .fail(function() {
                test.done();
            });
    }
}