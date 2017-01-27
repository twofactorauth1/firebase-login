/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

//process.env.NODE_ENV = "testing";
var app = require('../app');
var testHelpers = require('../testhelpers/testhelpers');
var testConfig = require('../testhelpers/configs/test.config.js');
var userDao = require('../dao/user.dao');
var accountDao = require('../dao/account.dao');
var contactDao = require('../dao/contact.dao');
var analyticsDao = require('../analytics/dao/analytics.dao');
var userActivityDao = require('../useractivities/dao/useractivity.dao');
require('moment');

module.exports.group = {
    setUp: function(cb) {
        cb();
    },

    tearDown: function(cb) {
        cb();
    },

    testFindCount: function(test) {
        var self = this;
        var query = {_id:{$exists:true}};
        accountDao.findCount(query, $$.m.Account, function(err, count){
            if(err) {
                test.ok(false, 'Error in findCount:', err);
            }
            console.log('count:', count);
            test.ok(true);
            test.done();
        });
    },

    testFindNear: function(test) {
        //TODO
        test.ok(true);
        test.done();
    },

    testFindManyWithFieldsAndLimit: function(test) {
        var self = this;
        var query = {_id:{$exists:true}};
        var fields = {'_id':1, 'subdomain':1, 'billing':1};
        var limit = 2;
        accountDao.findManyWithFields(query, fields, $$.m.Account, function(err, list){
            if(err) {
                test.ok(false, 'Error in findManyWithFields:', err);
            }
            console.log('list:', list);
            accountDao.findManyWithLimit(query, limit, $$.m.Account, function(err, list){
                if(err) {
                    test.ok(false, 'Error in findManyWithLimit:', err);
                } else {

                    test.ok(true);
                    test.done();
                }
            });
        });
    },

    testFindAndOrder: function(test) {
        var self = this;
        var query = {_id:{$exists:true}};
        var fields = {_id:1, subdomain:1, billing:1};
        accountDao.findAndOrder(query, fields, $$.m.Account, 'subdomain', -1, function(err, list){
            if(err) {
                test.ok(false, 'Error in findManyWithFields:', err);
            } else {
                console.log(list);
                test.ok(true);
                test.done();
            }

        });
    },

    testFindAllWithFields: function(test) {
        var self = this;
        var query = {_id:{$exists:true}};
        var fields = {_id:1, subdomain:1, billing:1};
        accountDao.findAllWithFields(query, 1, 'subdomain', fields, $$.m.Account, function(err, list){
            if(err) {
                test.ok(false, 'Error in testFindAllWithFields:', err);
            } else {
                console.log("testFindAllWithFields:", list);
                test.ok(true);
                test.done();
            }
        });
    },

    testFindAllWithFieldsAndLimit: function(test) {
        var self = this;
        var query = {_id:{$exists:true}};
        var fields = {_id:1, subdomain:1, billing:1};
        var skip = 1;
        var limit = 1;
        var sort = 'subdomain';
        accountDao.findAllWithFieldsAndLimit(query, skip, limit, {subdomain:1}, fields, $$.m.Account, function(err, list){
            if(err) {
                test.ok(false, 'Error in testFindAllWithFieldsAndLimit:', err);
                test.done();
            } else {
                console.log("testFindAllWithFieldsAndLimit:", list);
                test.ok(true);
                test.done();
            }
        });
    },

    testFindAllWithFieldsSortAndLimit: function(test) {
        var self = this;
        var query = {_id:{$exists:true}};
        var fields = {_id:1, subdomain:1, billing:1};
        var skip = 1;
        var limit = 1;
        var sort = 'subdomain';
        accountDao.findAllWithFieldsSortAndLimit(query, skip, limit, {subdomain:1}, fields, $$.m.Account, function(err, list){
            if(err) {
                test.ok(false, 'Error in testFindAllWithFieldsSortAndLimit:', err);
            } else {
                console.log("testFindAllWithFieldsSortAndLimit:", list);
                test.ok(true);
                test.done();
            }
        });
    },

    testFindWithFieldsLimitAndTotal: function(test) {
        var self = this;
        var query = {_id:{$exists:true}};
        var fields = {_id:1, subdomain:1, billing:1};
        var skip = 1;
        var limit = 1;
        var sort = 'subdomain';
        accountDao.findWithFieldsLimitAndTotal(query, skip, limit, sort, fields, $$.m.Account, function(err, list){
            if(err) {
                test.ok(false, 'Error in testFindWithFieldsLimitAndTotal:', err);
            } else {
                console.log("testFindWithFieldsLimitAndTotal:", list);
                test.ok(true);
                test.done();
            }
        });
    },

    testFindWithFieldsLimitOrderAndTotal: function(test) {
        var self = this;
        var query = {_id:{$exists:true}};
        var fields = {_id:1, subdomain:1, billing:1};
        var skip = 1;
        var limit = 1;
        var sort = 'subdomain';
        var type = $$.m.Account;
        var order_dir = -1;

        accountDao.findWithFieldsLimitOrderAndTotal(query, skip, limit, sort, fields, type, order_dir, function(err, list){
            if(err) {
                test.ok(false, 'Error in testFindWithFieldsLimitOrderAndTotal:', err);
            } else {
                console.log("testFindWithFieldsLimitOrderAndTotal:", list);
                test.ok(true);
                test.done();
            }
        });
    },

    testAggregate:function(test) {
        var self = this;
        var groupCriteria = {_first: '$_first', _last: '$_last'};
        var matchCriteria = {'accountId': 6 };
        contactDao.aggregate(groupCriteria, matchCriteria, $$.m.Contact, function(err, value){
            if(err) {
                test.ok(false, 'Error in testAggregate:', err);
            } else {
                console.log("testAggregate:", value);
                test.ok(true);
                test.done();
            }
        });
    },

    testAggregateWithSum:function(test) {
        var self = this;
        var groupCriteria = {_first: '$_first', _last: '$_last'};
        var matchCriteria = {'accountId': 6 };
        contactDao.aggregateWithSum(groupCriteria, matchCriteria, $$.m.Contact, function(err, value){
            if(err) {
                test.ok(false, 'Error in testAggregateWithSum:', err);
            } else {
                console.log("testAggregateWithSum:", value);
                test.ok(true);
                test.done();
            }
        });
    },

    testAggregateWithSumAndDupes:function(test) {
        var self = this;
        var groupCriteria = {_first: '$_first', _last: '$_last'};
        var matchCriteria = {'accountId': 6 };
        contactDao.aggregrateWithSumAndDupes(groupCriteria, matchCriteria, $$.m.Contact, function(err, value){
            if(err) {
                test.ok(false, 'Error in testAggregateWithSumAndDupes:', err);
            } else {
                console.log("testAggregateWithSumAndDupes:", value);
                test.ok(true);
                test.done();
            }
        });
    },
    testAggregateWithCustomStages:function(test) {
        var self = this;
        var startDate = moment().subtract(1, 'month').toDate();
        var endDate = moment().toDate();
        var stageAry = [];
        var match = {
            $match:{
                server_time_dt:{
                    $gte:startDate,
                    $lte:endDate
                }
            }
        };
        stageAry.push(match);
        var group1 = {
            $group: {
                _id:{
                    permanent_tracker:'$permanent_tracker'
                },
                count: {$sum:1}
            }
        };
        stageAry.push(group1);
        analyticsDao.aggregateWithCustomStages(stageAry, $$.m.SessionEvent, function(err, list){
            if(err) {
                test.ok(false, 'Error in testAggregateWithCustomStages:', err);
                test.done();
            } else {
                console.log("testAggregateWithCustomStages:", list);
                test.ok(true);
                test.done();
            }
        });
    },

    testExists:function(test) {
        var self = this;
        var query = {subdomain:'main'};
        var type = $$.m.Account;

        accountDao.exists(query, type, function(err, value){
            if(err) {
                test.ok(false, 'Error in testExists:', err);
            } else {
                console.log("testExists:", value);
                test.ok(true);
                test.done();
            }
        });
    },

    testPatch: function(test) {
        var id = '0db1ac26-77c2-4734-a26a-f0930e181423';
        userActivityDao.getById(id, $$.m.UserActivity, function(err, activity){
            if(err) {
                test.ok(false, 'Error in testPatch:', err);
            } else {
                var note = activity.get('note');
                var patch = {note:note + ' -patched'};
                userActivityDao.patch({_id:id}, patch, $$.m.UserActivity, function(err, value){
                    if(err) {
                        test.ok(false, 'Error in testPatch:', err);
                    } else {
                        console.log("testPatch:", value);
                        test.ok(true);
                        test.done();
                    }
                });
            }
        });
    },

    testFindAndModify: function(test) {
        var self = this;
        var id = '0db1ac26-77c2-4734-a26a-f0930e181423';
        var query = {_id:id};
        var sort = null;
        var remove = false;
        var update = {$set:{note: 'note'}};
        var isNew = true;
        var fields = null;
        var upsert = false;
        var bypassDocumentValidation = null;
        var writeConcern = null;

        var collection = userActivityDao.getTable($$.m.UserActivity);

        userActivityDao._findAndModifyMongo(collection, query, sort, remove, update, isNew, fields, upsert,
            bypassDocumentValidation, writeConcern, function(err, value){
                if(err) {
                    test.ok(false, 'Error in testFindAndModify:', err);
                } else {
                    console.log("testFindAndModify:", value);
                    test.ok(true);
                    test.done();
                }
        });
    },

    testDistinct: function(test) {
        var self = this;
        var key = 'accountId';
        var query = {_id:{$exists:true}};
        var type = $$.m.UserActivity;
        userActivityDao.distinct(key, query, type, function(err, value){
            if(err) {
                test.ok(false, 'Error in testDistinct:', err);
            } else {
                console.log("testDistinct:", value);
                test.ok(true);
                test.done();
            }
        });
    }
};

