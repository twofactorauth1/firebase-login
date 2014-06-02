/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

process.env.NODE_ENV = "testing";
var app = require('../app');
var async = require('async');
var testHelpers = require('../testhelpers/testhelpers');
var cmsDao = require('../dao/cms.dao');

var config = {
    themeId: "default"
};


module.exports.testThemeExists = function (test) {
    console.log("TESTING IF THEME EXISTS");

    cmsDao.themeExists(config.themeId, function (err, value) {
        if (err) {
            test.ok(false, "Error checking if theme exists");
            return test.done();
        }

        test.equal(value, true, "Theme exists");

        cmsDao.themeExists("mycompletelyfaketheme", function (err, value) {
            if (err) {
                test.ok(false, "Error checking if fake theme exists");
                return test.done();
            }

            test.equal(value, false, "Fake theme exists");
            test.done();
        });
    });
};


module.exports.testGetAllThemes = function (test) {
    console.log("TESTING GET ALL THEMES");

    cmsDao.getAllThemes(function (err, value) {
        if (err) {
            test.ok(false, "An error occurred getting all themes: " + err);
        } else {
            if (value != null && value.length > 0 && value[0].id != null) {
                test.ok(true, "Parsing theme configuration files");

                //Test Retrieve a Theme Config
                cmsDao.getThemeConfigSigned(value[0].id, function(err, value) {
                    if (err) {
                        test.ok(false, "Get ThemeConfig Signed");
                        return test.done();
                    }

                    test.notEqual(value, null, "Get Theme Config signed");
                    test.done();
                });
            } else {
                test.ok(false, "Parsing theme configuration files failed");
                return test.done();
            }
        }
    });
};


module.exports.group = {
    setUp: function (cb) {
        testHelpers.createTestUser(this, cb);
    },

    tearDown: function (cb) {
        testHelpers.destroyTestUser(this.user, cb);
    },


    testCreateAndDestroyWebsiteForAccount: function (test) {
        console.log("TESTING CREATE AND DESTROY WEBSITE FOR ACCOUNT");
        var self = this;

        var p1 = $.Deferred(), p2 = $.Deferred(), p3 = $.Deferred();
        cmsDao.getOrCreateWebsiteByAccountId(this.accountId, this.user.id(), function (err, value) {
            if (err) {
                test.ok(false, "An error occurred");
                return test.done();
            }

            test.notEqual(value, null, "Website does not equal null");

            var websiteId;
            if (value) {
                websiteId = value.id();
                test.notEqual(websiteId, null, "Website has ID");
                test.equal(value.get("accountId"), self.accountId, "Website AccountId is set properly");
                p1.resolve(websiteId);
            } else {
                p1.reject();
                return test.done();
            }
        });

        $.when(p1)
            .done(function (websiteId) {
                //Ensure the Account is set properly with the correct website
                cmsDao.getOrCreateWebsiteByAccountId(self.accountId, self.userId, function (err, value) {
                    if (err) {
                        test.ok(false, "An error occurred");
                        return test.done();
                    }

                    test.notEqual(value, null, "Website does not equal null");

                    if (value) {
                        test.equal(value.id(), websiteId, "Website retrieved for account successfully");
                        p2.resolve(websiteId);
                    } else {
                        test.ok(false, "Retrieved website for accountId");
                        p2.reject(websiteId);
                    }
                });
            })
            .fail(function () {
                test.done();
            });


        $.when(p2)
            .done(function (websiteId) {
                //Create a new website for the account
                cmsDao.createWebsiteForAccount(self.accountId, self.userId, function (err, value) {
                    if (err) {
                        test.ok(false, "An error occurred");
                        return test.done();
                    }

                    var websiteId2 = value.id();

                    cmsDao.switchDefaultWebsite(self.accountId, websiteId2, function (err, value) {
                        if (err) {
                            test.ok(false, "An error occurred");
                            return test.done();
                        }


                        test.equal(value.get("website").websiteId, websiteId2, "Website Switched properly on account");

                        async.parallel([
                            function (cb) {
                                cmsDao.deleteWebsite(websiteId, cb);
                            },

                            function (cb) {
                                cmsDao.deleteWebsite(websiteId2, cb);
                            }
                        ], function () {
                            console.log("TEST COMPLETE");
                            test.done();
                        });
                    });
                });
            })
            .fail(function (websiteId) {
                cmsDao.deleteWebsite(websiteId, function (err, value) {
                    return test.done();
                });
            });
    },


    testRenderIndexPage: function(test) {
        console.log("TESTING RENDER INDEX PAGE");

        cmsDao.getRenderedWebsitePageForAccount(this.accountId, "index", function(err, value) {
            test.equal(err, null, "No Error occurred getting rendered page");
            test.done();
        });
    }
};