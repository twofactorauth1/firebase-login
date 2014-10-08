/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./dao/dashboard.dao.js');
var dao = require('./dao/dashboard.dao.js');
var log = $$.g.getLogger("dashboard_manager");

module.exports = {

    createDashboard: function(dashboard, fn) {
        var self = this;
        log.debug('>> createDashboard');
        //TODO: look for dashboard for this account.  If it exists, update it.  Otherwise create.
        var accountId = dashboard.get('accountId');
        dao.findOne({'accountId': accountId}, $$.m.Dashboard, function(err, value){
            if(err) {
                log.error('Exception finding dashboards by account during create: ' + err);
                fn(err, null);
            } else if(value === null){
                log.debug('No dashboard exists for account '+ accountId + '.  Creating new dashboard.');
                dao.saveOrUpdate(dashboard, function(err, value){
                    if(err) {
                        log.error('Error creating dashboard: ' + err);
                        fn(err, null);
                    } else {
                        log.debug('<< createDashboard');
                        fn(null, value);
                    }
                });

            } else {
                log.debug('updating dashboard for account ' + accountId);
                value.set('modified', dashboard.get('created'));
                value.set('config', dashboard.get('config'));

                dao.saveOrUpdate(value, function(err, value){
                    if(err) {
                        log.error('Error creating dashboard: ' + err);
                        fn(err, null);
                    } else {
                        log.debug('<< createDashboard');
                        fn(null, value);
                    }
                });

            }
        });


    },

    getDashboard: function(dashboardId, fn) {
        var self = this;
        log.debug('>> getDashboard');
        dao.getById(dashboardId, $$.m.Dashboard, function(err, value){
            if(err) {
                log.error('Error getting dashboard: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getDashboard');
                fn(null, value);
            }
        });
    },

    updateDashboard: function(dashboard, fn) {
        var self = this;
        log.debug('>> updateDashboard');
        dao.saveOrUpdate(dashboard, function(err, value){
            if(err) {
                log.error('Error updating dashboard: ' + err);
                fn(err, null);
            } else {
                log.debug('<< updateDashboard');
                fn(null, value);
            }
        });
    },

    deleteDashboard: function(dashboardId, fn) {
        var self = this;
        log.debug('>> deleteDashboard');
        dao.removeById(dashboardId, $$.m.Dashboard, function(err, value){
            if(err) {
                log.error('Error deleting dashboard: ' + err);
                fn(err, null);
            } else {
                log.debug('<< deleteDashboard');
                fn(null, value);
            }
        });
    },

    getDashboardByAccount: function(accountId, fn) {
        var self = this;
        log.debug('>> getDashboardByAccount');

        dao.findOne({'accountId': accountId}, $$.m.Dashboard, function(err, value){
            if(err) {
                log.error('Exception finding dashboards by account: ' + err);
                fn(err, null);
            } else {
                log.debug('<< getDashboardByAccount');
                fn(null, value);
            }
        });

    }
};