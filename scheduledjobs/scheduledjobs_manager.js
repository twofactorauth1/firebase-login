var logger = $$.g.getLogger("scheduledjobs_manager");
var dao = require('./dao/scheduledjob.dao');
var async = require('async');
var JOB_KEY = 'scheduledJob';
var vm = require('vm');

var scheduledJobManager = {
    log:logger,
    JOB_KEY: JOB_KEY,
    scheduler: null,

    setScheduler:function(_scheduler) {
        this.scheduler = _scheduler;
    },

    /**
     * This method is called upon startup.  We need to account for server failures and multiple servers.
     *  1. Grab everything (not completed or executing) in scheduled_jobs.
     *  2. Soft-schedule each with the scheduler IF it is in the future (no need for persistence... we are handling that.)
     *  3. Execute any jobs in the past immediately.
     *
     *  When an event occurs
     *  1. FindAndUpdate by ID and set executing flag to true (this handles multiple servers)
     *  2. Execute the job
     *  3. Mark the job completed (with date)
     */
    startup:function(fn) {
        var self = this;
        self.log.debug('>> init');
        /*
         * look through scheduled_events
         */
        async.waterfall([
            function(cb) {
                self._findAllIncompleteJobs(function(err, jobs){
                    if(err) {
                        cb(err);
                    } else {
                        jobs = jobs || [];
                        self.log.debug('Initializing with ' + jobs.length + ' jobs');
                        cb(null, jobs);
                    }
                });
            },
            function(jobs, cb) {
                async.eachSeries(jobs, function(job, callback){
                    if(moment(job.get('scheduledAt')).isAfter(moment())) {
                        self._scheduleJob(job, callback);
                    } else {
                        /*
                         * Handle the job immediately.  Don't wait for callback.
                         */
                        try {
                            self._handleJob(job.id(), function(){});
                        } catch(Exception) {
                            self.log.error('Exception handling job.');
                        }

                        callback();
                    }
                }, function(err){
                    if(err) {
                        self.log.error('Error scheduling or handling existing jobs:', err);
                        cb(err);
                    } else {
                        self.log.debug('All jobs scheduled or submitted.');
                        cb();
                    }
                });
            }
        ], function done(err){
            if(err) {
                self.log.error('Error during initialization:', err);
            } else {
                self.log.debug('<< init');
            }
            self.scheduler.on(self.JOB_KEY, function(params){
                self.handleJob(params.jobId, function(){});
            });
            if(fn) {
                fn();
            }
        });
    },

    /**
     * Stores job in DB and then schedules with scheduler
     * @param job
     * @param fn
     */
    scheduleJob: function(job, fn) {
        var self = this;
        self.log.debug('>> scheduleJob');
        if(typeof job.id === 'undefined') {
           job = new $$.m.ScheduledJob(job);
        }
        job.set('executing', false);
        job.set('completedAt', null);
        job.set('runAt', null);

        dao.saveOrUpdate(job, function(err, savedJob){
            if(err) {
                self.log.error('Error saving job:', err);
                self.log.error('This Job has NOT been scheduled');
                fn(err);
            } else {
                self._scheduleJob(job, function(err, value){
                    if(err) {
                        self.log.error('Error scheduling job:', err);
                        fn(err);
                    } else {
                        self.log.debug('<< scheduleJob');
                        fn(null, savedJob);
                    }
                });
            }
        });
    },

    handleJob: function(jobId, fn) {
        var self = this;
        self.log.debug('>> handleJob(' + jobId + ')');
        self._handleJob(jobId, function(err, value){
            self.log.debug('<< handleJob(' + jobId + ')');
            fn(err, value);
        });

    },

    cancelJob: function(jobId, fn) {
        var self = this;
        self.log.debug('>> cancelJob');
        var query = {_id:jobId};
        dao.removeByQuery(query, $$.m.ScheduledJob, function(err, value){
            if(err) {
                self.log.error('Error cancelling job:', err);
                return fn(err);
            } else {
                self.log.debug('<< cancelJob');
                return fn(null, value);
            }
        });
    },

    cancelCampaignJob: function(campaignId, fn) {
        var self = this;
        self.log.debug('>> cancelCampaignJob');
        var query = {campaignId:campaignId};
        dao.removeByQuery(query, $$.m.ScheduledJob, function(err, value){
            if(err) {
                self.log.error('Error cancelling job:', err);
                return fn(err);
            } else {
                self.log.debug('<< cancelCampaignJob');
                return fn(null, value);
            }
        });
    },

    listUniqueJobs: function(accountId, userId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> listUniqueJobs');
        var stageAry = [];

        var match = {$match:{_id:{$ne:'__counter__'}}};
        stageAry.push(match);
        var sort = {$sort:{scheduledAt:-1}};
        stageAry.push(sort);
        var group = {$group:{_id:{$substr:['$job', 0, 50]}, count:{$sum:1}, lastRun:{$max:'$completedAt'}, nextRun:{$max:'$scheduledAt'}, docid:{$first:'$_id'}}};
        stageAry.push(group);
        dao.aggregateWithCustomStages(stageAry, $$.m.ScheduledJob, function(err, list){
            if(err) {
                self.log.error(accountId, userId, 'Error in aggregation:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< listUniqueJobs');
                fn(null, list);
            }
        });
    },

    rescheduleJob: function(accountId, userId, jobId, newDate, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> rescheduleJob');
        if(!jobId) {
            self.log.error(accountId, userId, 'No jobId supplied');
            return fn('No jobId supplied');
        }
        dao.findOne({_id:jobId}, $$.m.ScheduledJob, function(err, job){
            if(err) {
                self.log.error(accountId, userId, 'Error finding job:', err);
                fn(err);
            } else {
                if(!newDate) {
                    newDate = new Date();
                }
                job.set('scheduledAt', newDate);
                job.set('runAt',null);
                job.set('completedAt', null);
                job.set('executing', false);
                self.scheduleJob(job, function(err, value){
                    if(err) {
                        self.log.error(accountId, userId, 'Error saving job:', err);
                        fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< rescheduleJob');
                        return fn(null, value);
                    }
                });
            }
        });
    },

    _findAllIncompleteJobs: function(callback) {
        var self = this;
        self.log.debug('>> _findAllIncompleteJobs');
        var query = {
            completedAt:null,
            executing:false
        };
        dao.findMany(query, $$.m.ScheduledJob, function(err, jobs){
            if(err) {
                self.log.error('Error finding scheduled jobs:', err);
                callback(err);
            } else {
                self.log.debug('<< _findAllIncompleteJobs');
                callback(null, jobs);
            }
        });
    },

    _scheduleJob:function(job, fn) {
        var self = this;
        self.log.debug('>> _scheduleJob');
        if(self.scheduler) {
            self.scheduler.schedule(job.get('scheduledAt'), self.JOB_KEY, {jobId:job.id()});
            self.log.debug('Scheduling: [' + job.id() + '] at ' + job.get('scheduledAt'));
        } else {
            self.log.warn('Cannot schedule job. No scheduler set.');
        }
        self.log.debug('<< _scheduleJob');
        fn();
    },

    _handleJob: function(jobId, fn) {
        var self = this;
        self.log.debug('>> _handleJob');
        /*
         * find and update to ensure lock
         */
        dao.markJobAsExecuting(jobId, function(err, value){
            if(err) {
                self.log.error('Error marking job for execution:', err);
                fn(err);
            } else if(!value) {
                self.log.info('Could not get lock on job [' + jobId + '].  Skipping.');
                fn(null, null);
            } else {
                try {
                    self.log.debug('About to execute:', value);
                    //var context = vm.createContext();
                    //var script = new vm.Script(value.get('job'));
                    //script.runInContext(context);
                    vm.runInThisContext(value.job);
                    value.executing = false;
                    value.completedAt = new Date();

                    dao.saveOrUpdate(new $$.m.ScheduledJob(value), function(err, updatedJob){
                        if(err) {
                            self.log.error('Error updating completed job:', err);
                            fn(err);
                        } else {
                            self.log.debug('<< _handleJob');
                            fn(null, updatedJob);
                        }
                    });
                } catch(Exception) {
                    self.log.error('Exception running job:', Exception);
                    value.set('executing', false);
                    dao.saveOrUpdate(value, fn);
                }
            }
        });
    }
};

module.exports = scheduledJobManager;