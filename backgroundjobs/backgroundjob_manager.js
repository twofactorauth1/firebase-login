/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var dao = require('./dao/backgroundjob.dao');
var model = require('./model/backgroundjob');
var log = $$.g.getLogger("backgroundjob_manager");

var backgroundJobManager = {
    log:log,

    createBackgroundJob: function(accountId, userId, name, restartAble, restartCode, itemsTotal, fn){
        var self = this;
        self.log.debug(accountId, userId, '>> createBackgroundJob');

        var job = new $$.m.BackgroundJob({
            accountId:accountId,
            name:name,
            restartAble:restartAble,
            restartCode:restartCode,
            itemsTotal:itemsTotal,
            created:{date:new Date(), by:userId},
            modified:{date: new Date(), by:userId}
        });
        dao.saveOrUpdate(job, function(err, job){
            if(err) {
                self.log.error(accountId, userId, 'Error creating background job:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< createBackgroundJob');
                fn(null, job);
            }
        });
    },

    updateBackgroundJob: function(accountId, userId, job, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> updateBackgroundJob');
        var modified = job.get('modified') || {};
        modified.date = new Date();
        modified.by = userId;
        job.set('modified', modified);
        dao.saveOrUpdate(job, function(err, job){
            if(err) {
                self.log.error(accountId, userId, 'Error updating background job:', err);
                fn(err);
            } else {
                self.log.debug(accountId, userId, '<< updateBackgroundJob');
                fn(null, job);
            }
        });
    },

    startBackgroundJob: function(accountId, userId, jobId, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> startBackgroundJob');

        dao.findOne({_id:jobId, accountId:accountId}, $$.m.BackgroundJob, function(err, job){
            if(err || !job) {
                self.log.error('Error loading job:', err);
                fn(err || 'Could not load job');
            } else {
                job.set('startTime', new Date());
                job.set('status', 'RUNNING');
                var modified = job.get('modified') || {};
                modified.date = new Date();
                modified.by = userId;
                job.set('modified', modified);
                dao.saveOrUpdate(job, function(err, job){
                    if(err) {
                        self.log.error(accountId, userId, 'Error updating background job:', err);
                        fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< startBackgroundJob');
                        fn(null, job);
                    }
                });
            }
        });
    },

    updateJobProgress: function(accountId, userId, jobId, itemsCompleted, progressPct, fn) {
        var self = this;
        self.log.debug(accountId, userId, '>> updateJobProgress');

        dao.findOne({_id:jobId, accountId:accountId}, $$.m.BackgroundJob, function(err, job) {
            if (err || !job) {
                self.log.error('Error loading job:', err);
                fn(err || 'Could not load job');
            } else {
                if(!job.get('startTime')) {
                    job.set('startTime', new Date());
                }

                //figure out %
                var oldItemsCompleted = job.get('itemsCompleted');
                var oldProgressPct = job.get('progressPct');
                var itemsTotal = job.get('itemsTotal');
                if(!progressPct) {
                    progressPct = itemsCompleted / itemsTotal;
                    self.log.debug('calculated progressPct as ', progressPct);//TODO: remove
                }
                //figure out duration
                if(progressPct < 1.0) {
                    var pctDifference = progressPct - oldProgressPct;
                    var duration = moment().diff(job.get('modified').date); //ms
                    //totalRemaining / pctDifference * duration
                    var totalRemainingPct = 1.0 - progressPct;
                    var estimatedRemainingMS = (totalRemainingPct / pctDifference) * duration;
                    job.set('estimatedRemaining', estimatedRemainingMS);
                    self.log.debug('calculated estimatedRemaining as ', estimatedRemainingMS);//TODO: remove
                } else {
                    //we are done
                    job.set('estimatedRemaining', 0);
                    job.set('endTime', new Date());
                    job.set('status', 'COMPLETED');
                }
                job.set('itemsCompleted', itemsCompleted);
                job.set('progressPct', progressPct);
                var modified = job.get('modified') || {};
                modified.date = new Date();
                modified.by = userId;
                job.set('modified', modified);
                dao.saveOrUpdate(job, function(err, job){
                    if(err) {
                        self.log.error(accountId, userId, 'Error updating background job:', err);
                        fn(err);
                    } else {
                        self.log.debug(accountId, userId, '<< updateJobProgress');
                        fn(null, job);
                    }
                });
            }
        });
    }
};


$$.u = $$.u || {};
$$.u.backgroundJobManager = backgroundJobManager;

module.exports = backgroundJobManager;
