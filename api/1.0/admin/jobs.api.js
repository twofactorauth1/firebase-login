/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2017
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../../base.api');
var accountDao = require('../../../dao/account.dao');
var manager = require('../../../scheduledjobs/scheduledjobs_manager');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "admin/jobs",

    dao: accountDao,

    initialize: function() {
        app.get(this.url('scheduled'), this.secureauth.bind(this, {requiresSub:true}), this.listScheduledJobs.bind(this));
        app.post(this.url(':id/reschedule'), this.secureauth.bind(this, {requiresSub:true}), this.rescheduleJob.bind(this));
    },

    listScheduledJobs: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        self.log.debug(accountId, userId, '>> listScheduledJobs');
        self._isAdmin(req, function(err, value) {
            if (value !== true) {
                return self.send403(resp);
            } else {
                manager.listUniqueJobs(accountId, userId, function(err, value){
                    self.log.debug(accountId, userId, '<< listScheduledJobs');
                    return self.sendResultOrError(resp, err, value, "Error listing jobs");
                });
            }
        });
    },

    rescheduleJob: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        var jobId = req.params.id;
        self.log.debug(accountId, userId, '>> rescheduleJob [' + jobId + ']');
        self._isAdmin(req, function(err, value) {
            if (value !== true) {
                return self.send403(resp);
            } else {
                var newDate = null;
                if(req.body.date) {
                    newDate = moment(req.body.date).toDate();
                }
                manager.rescheduleJob(accountId, userId, jobId, newDate, function(err, value){
                    self.log.debug(accountId, userId, '<< rescheduleJob');
                    return self.sendResultOrError(resp, err, value, "Error rescheduling job");
                });

            }
        });
    },


    /**
     *
     * @param req
     * @param fn
     * @private
     */
    _isAdmin: function(req, fn) {
        var self = this;
        if(self.userId(req) === 1 || self.userId(req)===4) {
            fn(null, true);
        } else if(_.contains(req.session.permissions, 'manager')){
            fn(null, true);
        } else {
            fn(null, false);
        }
    }

});

module.exports = new api();