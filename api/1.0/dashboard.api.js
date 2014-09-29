/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var manager = require('../../dashboard/dashboard_manager');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "dashboard",

    log: $$.g.getLogger("dashboard.api"),

    initialize: function () {

        app.post(this.url(''), this.isAuthApi, this.createDashboard.bind(this));
        app.get(this.url('/:id'), this.isAuthApi, this.getDashboard.bind(this));
        app.get(this.url(''), this.isAuthApi, this.getDashboardForAccount.bind(this));
        app.post(this.url('/:id'), this.isAuthApi, this.updateDashboard.bind(this));
        app.delete(this.url('/:id'), this.isAuthApi, this.deleteDashboard.bind(this));


    },

    /*
     * Creates a dashboard object.  Only property needed on dashboard object is the 'config'.
     */
    createDashboard: function(req, res) {
        var self = this;
        self.log.debug('>> createDashboard');

        var dashboard = req.body;
        dashboard.accountId = self.accountId(req);
        dashboard.created = {
            date: new Date(),
            by: req.user
        };
        //TODO: security
        manager.createDashboard(dashboard, function(err, value){
            self.log.debug('<< createDashboard');
            self.sendResultOrError(res, err, value, "Error creating dashboard");
        });

    },

    getDashboard: function(req, res) {
        var self = this;
        self.log.debug('>> getDashboard');

        var dashboardId = req.params.id;
        //TODO: security

        manager.getDashboard(dashboardId, function(err, value){
            self.log.debug('<< getDashboard');
            self.sendResultOrError(res, err, value, "Error retrieving dashboard");
        });

    },

    updateDashboard: function(req, res) {
        var self = this;
        self.log.debug('>> updateDashboard');

        var dashboard = req.body;
        var dashboardId = req.params.id;
        dashboard._id = dashboardId;

        dashboard.modified = {
            date: new Date(),
            by: req.user
        };

        //TODO: security

        manager.updateDashboard(dashboard, function(err, value){
            self.log.debug('<< updateDashboard');
            self.sendResultOrError(res, err, value, 'Error updating dashboard');
        });
    },

    deleteDashboard: function(req, res) {
        var self = this;
        self.log.debug('>> deleteDashboard');
        var dashboardId = req.params.id;

        //TODO: security
        manager.deleteDashboard(dashboardId, function(err, value){
            self.log.debug('<< deleteDashboard');
            self.sendResultOrError(res, err, value, 'Error deleting dashboard');
        });
    },

    getDashboardForAccount: function(req, res) {
        var self = this;
        self.log.debug('>> getDashboardForAccount');

        var accountId = parseInt(self.accountId(req));
        //TODO: security

        manager.getDashboardByAccount(accountId, function(err, value){
            self.log.debug('<< getDashboardForAccount');
            self.sendResultOrError(res, err, value, 'Error getting dashboard for account.');
        });
        
    }
});

module.exports = new api();
