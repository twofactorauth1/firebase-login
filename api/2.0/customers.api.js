/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api.js');
var dao = require('../../customers/dao/customer.dao');
var manager = require('../../customers/customer_manager');

var appConfig = require('../../configs/app.config');


var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "customers",

    version: "2.0",

    dao: dao,

    initialize: function () {

        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.listCustomers.bind(this));
        app.get(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.getCustomer.bind(this));
        app.post(this.url('customer/:id/notes'), this.isAuthAndSubscribedApi.bind(this), this.addCustomerNotes.bind(this));

        //app.delete(this.url(':type/:key'), this.isAuthAndSubscribedApi.bind(this), this.deleteComponentData.bind(this));


    },

    listCustomers: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listCustomers');
        var sortBy = req.query.sortBy || '_id';
        var sortDir = req.query.sortDir || 1;
        var skip = 0;
        if(req.query.skip) {
            skip = parseInt(req.query.skip);
        }
        var limit = 50;
        if(req.query.limit) {
            limit = parseInt(req.query.limit);
        }

        if(accountId === appConfig.mainAccountID) {
            manager.getMainCustomers(accountId, userId, sortBy, sortDir, skip, limit, function(err, customers){
                self.log.debug(accountId, userId, '<< listCustomers');
                self.sendResultOrError(resp, err, customers, 'Error listing customers');
            });
        } else {
            manager.getCustomers(accountId, userId, sortBy, sortDir, skip, limit , function(err, customers){
                self.log.debug(accountId, userId, '<< listCustomers');
                self.sendResultOrError(resp, err, customers, 'Error listing customers');
            });
        }

    },

    getCustomer: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getCustomer');
        var customerId = parseInt(req.params.id);

        if(accountId === appConfig.mainAccountID) {
            manager.getMainCustomer(accountId, userId, customerId, function(err, customer){
                self.log.debug(accountId, userId, '<< getCustomer');
                self.sendResultOrError(resp, err, customer, 'Error getting customer');
            });
        } else {
            self.wrapError(resp, 400, 'Unsupported Method', 'This method is unsupported');
        }
    },

    addCustomerNotes: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        var customerId = parseInt(req.params.id);
        var notes = req.body.notes;
        if(accountId === appConfig.mainAccountID) {
            manager.addCustomerNotes(accountId, userId, customerId, notes,  function(err, customer){
                self.log.debug(accountId, userId, '<< addCustomerNotes');
                self.sendResultOrError(resp, err, customer, 'Error adding notes');
            });
        } else {
            self.wrapError(resp, 400, 'Unsupported Method', 'This method is unsupported');
        }
    }
    

});

module.exports = new api({version:'2.0'});

