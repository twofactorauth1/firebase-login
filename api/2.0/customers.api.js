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
var urlUtils = require('../../utils/urlutils');
var orgDao = require('../../organizations/dao/organization.dao');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "customers",

    version: "2.0",

    dao: dao,

    initialize: function () {

        app.get(this.url(''), this.isAuthAndSubscribedApi.bind(this), this.listCustomers.bind(this));
        app.get(this.url('all'), this.isAuthAndSubscribedApi.bind(this), this.listAllCustomers.bind(this));
        app.get(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.getCustomer.bind(this));
        app.get(this.url('single/:id'), this.isAuthAndSubscribedApi.bind(this), this.getSingleCustomer.bind(this));
        app.post(this.url('customer/:id/notes'), this.isAuthAndSubscribedApi.bind(this), this.addCustomerNotes.bind(this));
        app.post(this.url('customer/:id/templateAccount'), this.isAuthAndSubscribedApi.bind(this), this.updateCustomerTemplateAccount.bind(this));
        app.post(this.url('customer/:id/insights'), this.isAuthAndSubscribedApi.bind(this), this.updateCustomerInsights.bind(this));
        app.post(this.url('customer/:id/showhide'), this.isAuthAndSubscribedApi.bind(this), this.updateCustomerShowHide.bind(this));
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
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            orgDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err) {
                    self.log.error(accountId, userId, 'Error getting organization:', err);
                    self.wrapError(resp, 500, 'Error getting Organization', 'Error getting organization');
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        manager.getOrganizationCustomers(accountId, userId, organization.id(), sortBy, sortDir, skip, limit, function(err, customers){
                            self.log.debug(accountId, userId, '<< listAllCustomers');
                            self.sendResultOrError(resp, err, customers, 'Error listing customers');
                        });
                    } else {
                        manager.getCustomers(accountId, userId, sortBy, sortDir, skip, limit, function(err, customers){
                            self.log.debug(accountId, userId, '<< listAllCustomers');
                            self.sendResultOrError(resp, err, customers, 'Error listing customers');
                        });
                    }
                }
            });
        } else {
            manager.getCustomers(accountId, userId, sortBy, sortDir, skip, limit , function(err, customers){
                self.log.debug(accountId, userId, '<< listCustomers');
                self.sendResultOrError(resp, err, customers, 'Error listing customers');
            });
        }

    },


    listAllCustomers: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listAllCustomers');
        

        if(accountId === appConfig.mainAccountID) {
            manager.getMainCustomers(accountId, userId, null, null, null, null, function(err, customers){
                self.log.debug(accountId, userId, '<< listAllCustomers');
                self.sendResultOrError(resp, err, customers, 'Error listing customers');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            orgDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err) {
                    self.log.error(accountId, userId, 'Error getting organization:', err);
                    self.wrapError(resp, 500, 'Error getting Organization', 'Error getting organization');
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        manager.getOrganizationCustomers(accountId, userId, organization.id(), null, null, null, null, function(err, customers){
                            self.log.debug(accountId, userId, '<< listAllCustomers');
                            self.sendResultOrError(resp, err, customers, 'Error listing customers');
                        });
                    } else {
                        manager.getCustomers(accountId, userId, null, null, null, null , function(err, customers){
                            self.log.debug(accountId, userId, '<< listAllCustomers');
                            self.sendResultOrError(resp, err, customers, 'Error listing customers');
                        });
                    }
                }
            });
        } else {
            manager.getCustomers(accountId, userId, null, null, null, null , function(err, customers){
                self.log.debug(accountId, userId, '<< listAllCustomers');
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
            manager.getMainCustomer(req, accountId, userId, customerId, function(err, customer){
                self.log.debug(accountId, userId, '<< getCustomer');
                self.sendResultOrError(resp, err, customer, 'Error getting customer');
            });
        } else {
            self.isOrgAdmin(accountId, userId, req, function(err, val){
                if(val === true) {
                    manager.getOrgCustomer(req, accountId, userId, customerId, urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, customer){
                        self.log.debug(accountId, userId, '<< getCustomer');
                        self.sendResultOrError(resp, err, customer, 'Error getting customer');
                    });
                } else {
                    self.wrapError(resp, 400, 'Unsupported Method', 'This method is unsupported');
                }
            });

        }
    },

    getSingleCustomer: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getSingleCustomer');
        var customerId = parseInt(req.params.id);

        if(accountId === appConfig.mainAccountID) {
            manager.getSingleCustomer(accountId, userId, customerId, function(err, customer){
                self.log.debug(accountId, userId, '<< getSingleCustomer');
                self.sendResultOrError(resp, err, customer, 'Error getting customer');
            });
        } else {
            self.isOrgAdmin(accountId, userId, req, function(err, val){
                if(val === true) {
                    manager.getSingleOrgCustomer(accountId, userId, customerId, urlUtils.getSubdomainFromRequest(req).orgDomain,function(err, customer){
                        self.log.debug(accountId, userId, '<< getCustomer');
                        self.sendResultOrError(resp, err, customer, 'Error getting customer');
                    });

                } else {
                    self.wrapError(resp, 400, 'Unsupported Method', 'This method is unsupported');
                }
            });
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
            self.isOrgAdmin(accountId, userId, req, function(err, val) {
                if (val === true) {
                    var orgDomain = urlUtils.getSubdomainFromRequest(req).orgDomain;
                    manager.addOrgCustomerNotes(accountId, userId, customerId, notes, orgDomain, function(err, customer){
                        self.log.debug(accountId, userId, '<< addCustomerNotes');
                        self.sendResultOrError(resp, err, customer, 'Error adding notes');
                    });
                } else {
                    self.wrapError(resp, 400, 'Unsupported Method', 'This method is unsupported');
                }
            });

        }
    },

    updateCustomerTemplateAccount: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateCustomerTemplateAccount');
        var customerId = parseInt(req.params.id);
        var customerDetails = req.body;
        if(accountId === appConfig.mainAccountID) {
            manager.updateCustomerTemplateAccount(accountId, userId, customerId, customerDetails, function(err, updatedCustomer){
                self.log.debug(accountId, userId, '<< updateCustomerTemplateAccount');
                self.sendResultOrError(resp, err, updatedCustomer, 'Error updating template account');
            });
        } else {
            self.isOrgAdmin(accountId, userId, req, function(err, val) {
                if (val === true) {
                    var orgDomain = urlUtils.getSubdomainFromRequest(req).orgDomain;
                    manager.updateCustomerTemplateAccount(accountId, userId, customerId, customerDetails, function(err, updatedCustomer){
                        self.log.debug(accountId, userId, '<< updateCustomerTemplateAccount');
                        self.sendResultOrError(resp, err, updatedCustomer, 'Error updating template account');
                    });
                } else {
                    self.wrapError(resp, 400, 'Unsupported Method', 'This method is unsupported');
                }
            });
        }
    },

    updateCustomerInsights: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateCustomerInsights');
        var customerId = parseInt(req.params.id);
        var customerDetails = req.body;
        if(accountId === appConfig.mainAccountID) {
            manager.updateCustomerInsights(accountId, userId, customerId, customerDetails, function(err, updatedCustomer){
                self.log.debug(accountId, userId, '<< updateCustomerInsights');
                self.sendResultOrError(resp, err, updatedCustomer, 'Error updating insights');
            });
        } else {
            self.isOrgAdmin(accountId, userId, req, function(err, val) {
                if (val === true) {
                    var orgDomain = urlUtils.getSubdomainFromRequest(req).orgDomain;
                    manager.updateCustomerInsights(accountId, userId, customerId, customerDetails, function(err, updatedCustomer){
                        self.log.debug(accountId, userId, '<< updateCustomerInsights');
                        self.sendResultOrError(resp, err, updatedCustomer, 'Error updating insights');
                    });
                } else {
                    self.wrapError(resp, 400, 'Unsupported Method', 'This method is unsupported');
                }
            });
        }
    },

    updateCustomerShowHide: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateCustomerShowHide');
        var customerId = parseInt(req.params.id);
        var customerDetails = req.body.showhide;
        if(accountId === appConfig.mainAccountID) {
            manager.updateCustomerShowHide(accountId, userId, customerId, customerDetails, function(err, updatedCustomer){
                self.log.debug(accountId, userId, '<< updateCustomerShowHide');
                self.sendResultOrError(resp, err, updatedCustomer, 'Error updating showhide');
            });
        } else {
            self.isOrgAdmin(accountId, userId, req, function(err, val) {
                if (val === true) {
                    var orgDomain = urlUtils.getSubdomainFromRequest(req).orgDomain;
                    manager.updateCustomerShowHide(accountId, userId, customerId, customerDetails, function(err, updatedCustomer){
                        self.log.debug(accountId, userId, '<< updateCustomerShowHide');
                        self.sendResultOrError(resp, err, updatedCustomer, 'Error updating showhide');
                    });
                } else {
                    self.wrapError(resp, 400, 'Unsupported Method', 'This method is unsupported');
                }
            });
        }
    }
});

module.exports = new api({version:'2.0'});

