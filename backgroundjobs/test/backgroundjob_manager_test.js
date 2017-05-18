process.env.NODE_ENV = "testing";
var app = require('../../app');
var manager = require('../backgroundjob_manager');
var _ = require('underscore');

exports.backgroundjob_manager_test = {

    setUp: function (cb) {
        cb();
    },

    tearDown: function (cb) {
        cb();
    },

    testProgress: function(test) {
        var accountId = 0;
        var userId = 0;
        var name = 'Test Job';
        var itemsTotal = 10;
        test.expect(4);
        manager.createBackgroundJob(accountId, userId, name, false, null, itemsTotal, function(err, value){
            test.notEqual(value, null);
            var jobId = value.id();
            manager.startBackgroundJob(accountId, userId, jobId, function(err, value){
                _.delay(function(){
                    manager.updateJobProgress(accountId, userId, jobId, 5, null, function(err, updatedJob){
                        test.equal(updatedJob.get('progressPct'),.5);
                        _.delay(function(){
                            manager.updateJobProgress(accountId, userId, jobId, 10, null, function(err, updatedJob){
                                test.equal(updatedJob.get('progressPct'),1.0);
                                test.notEqual(updatedJob.get('endTime'), null);
                                test.done();
                            });
                        }, 600);
                    });
                }, 500);
            });

        });
    }

};