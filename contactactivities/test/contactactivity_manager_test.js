/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var manager = require('../contactactivity_manager.js');
var dao = require('../dao/contactactivity.dao.js');
var async = require('async');

var _log = $$.g.getLogger("contactactivity_manager_test");
var testContext = {};
var initialized = false;

exports.contactactivity_manager_test = {
    setUp: function (cb) {
        var self = this;
        //delete all objects
        if (!initialized) {
            dao.findMany({}, $$.m.ContactActivity, function (err, list) {
                if (err) {
                    _log.error('Exception removing events.  Tests may not be accurate.');
                } else {
                    async.each(list,
                        function (activity, callback) {
                            dao.remove(activity, function (err, value) {
                                callback();
                            });
                        }, function (err) {
                            initialized = true;
                            cb();
                        });
                }
            });
        } else {
            cb();
        }
    },

    tearDown: function (cb) {
        var self = this;
        cb();
    },

    testCreateContactActivity: function (test) {

        var date = new Date();
        testContext.date = date;

        var ca = new $$.m.ContactActivity({
            accountId: 0,
            contactId: 0,
            activityType: $$.m.ContactActivity.types.PAGE_VIEW,
            note: "Page View",
            detail: "Viewed page",
            duration: null,
            start: date, //datestamp
            end: date   //datestamp
        });

        manager.createActivity(ca, function (err, value) {
            if (err) {
                test.ok(false, 'Create activity failed.');
                test.done();
            } else {
                test.done();
            }
        });

    },

    testListActivities: function (test) {
        test.expect(2);
        manager.listActivities(0, null, null, function (err, value) {
            if (err) {
                test.ok(false, 'list activities failed.');
                test.done();
            } else {
                test.equals(1, value.length);
                test.equals('PAGE_VIEW', value[0].get('activityType'));
                test.done();
            }
        });
    },

    testListActivitiesByContactId: function (test) {
        test.expect(2);
        manager.listActivitiesByContactId(0, 0, null, null, null, function (err, list) {
            if (err) {
                test.ok(false, 'list activities by contact failed.');
                test.done();
            } else {
                test.equals(1, list.length);
                test.equals(0, list[0].get('contactId'));
                test.done();
            }
        });
    },

    testFindActivitiesByActivityType: function (test) {
        test.expect(2);
        var activityTypeAry = [$$.m.ContactActivity.types.PAGE_VIEW];

        manager.findActivities(null, null, activityTypeAry, null, null, null, null, null, null, null, function (err, list) {
            if (err) {
                test.ok(false, 'list activities by activity type failed.');
                test.done();
            } else {
                test.equals(1, list.total);
                test.equals(0, list.results[0].get('contactId'));
                test.done();
            }
        });

    },

    testFindActivitiesByText: function (test) {
        var text = 'ge';
        test.expect(2);
        manager.findActivities(null, null, null, text, null, null, null, null, null, null, function (err, list) {
            if (err) {
                test.ok(false, 'list activities by text failed.');
                test.done();
            } else {
                test.equals(1, list.total);
                test.equals(0, list.results[0].get('contactId'));
                test.done();
            }
        });
    },

    testFindActivitiesByDateRange: function (test) {
        var date = testContext.date;

        manager.findActivities(null, null, null, null, null, date, date, null, null, null, function (err, list) {
            if (err) {
                test.ok(false, 'list activities by date range.');
                test.done();
            } else {
                test.equals(1, list.total);
                test.equals(0, list.results[0].get('contactId'));
                test.done();
            }
        });


    }



}
