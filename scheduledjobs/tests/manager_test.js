/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */
process.env.NODE_ENV = "testing";
var app = require('../../app');
var manager = require('../scheduledjobs_manager');
var dao = require('../dao/scheduledjob.dao');
var async = require('async');

var _log = $$.g.getLogger("scheduledjobs_manager_test");
var testContext = {};
var initialized = false;

var drone = require('schedule-drone');

var manager = null;
var mongoConfig = require('../../configs/mongodb.config');

exports.subscription_dao_test = {
    setUp: function (cb) {
        var self = this;
        if(manager === null) {
            drone.setConfig(
                {
                    persistence:{
                        type:'mongodb',
                        connectionString:mongoConfig.MONGODB_CONNECT,
                        eventsCollection: 'scheduled_events',
                        options:{}
                    }
                }
            );
            var scheduler = drone.daemon();
            $$.u = $$.u || {};
            $$.u.scheduler = scheduler;
            manager = require('../scheduledjobs_manager');
            manager.setScheduler(scheduler);
        }
        cb();
    },

    tearDown: function (cb) {
        var self = this;
        cb();
    },

    testScheduleJob: function(test) {
        var self = this;
        test.expect(1);
        var tomorrow = moment().add(1, 'days');
        var jobToDo = 'console.log("whatever");';
        var job = new $$.m.ScheduledJob({
            accountId:0,
            scheduledAt: tomorrow,
            job: jobToDo
        });
        manager.scheduleJob(job, function(err, savedJob){
            test.ok(savedJob);
            testContext.jobId = savedJob.id();
            test.done();
        });
    },

    testHandleJob: function(test) {
        test.expect(2);
        var jobId = testContext.jobId;
        manager.handleJob(jobId, function(err, value){
            dao.findOne({_id:jobId}, $$.m.ScheduledJob, function(err, savedJob){
                test.ok(savedJob.get('completedAt'));
                test.ok(savedJob.get('runAt'));
                test.done();
            });
        });
    },

    testJobHandledOnce: function(test) {
        test.expect(3);
        var tomorrow = moment().add(1, 'days');
        var jobToDo = 'console.log("whatever");';
        var job = new $$.m.ScheduledJob({
            accountId:0,
            scheduledAt: tomorrow,
            job: jobToDo
        });
        var p1 = $.Deferred();
        var p2 = $.Deferred();
        manager.scheduleJob(job, function(err, savedJob){
            test.ok(savedJob);
            var jobId = savedJob.id();
            manager.handleJob(jobId, function(err, value){
                console.log('Returned:', value);
                test.ok(value);
                p1.resolve();
            });
            manager.handleJob(jobId, function(err, value){
                console.log('Returned Here:', value);
                test.ok(!value);
                p2.resolve();
            });
        });
        $.when(p1,p2).done(function(){
            test.done();
        });
    }



};
