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
        app.post(this.url('customer/:id/refreshTemplateImage'), this.isAuthAndSubscribedApi.bind(this), this.refreshTemplateImage.bind(this));
        app.post(this.url('customer/:id/oem'), this.isAuthAndSubscribedApi.bind(this), this.updateCustomerOEM.bind(this));
        app.post(this.url('customer/:id/insights'), this.isAuthAndSubscribedApi.bind(this), this.updateCustomerInsights.bind(this));
        app.post(this.url('customer/:id/showhide'), this.isAuthAndSubscribedApi.bind(this), this.updateCustomerShowHide.bind(this));
        //app.delete(this.url(':type/:key'), this.isAuthAndSubscribedApi.bind(this), this.deleteComponentData.bind(this));
        app.get(this.url('paged/list'), this.isAuthAndSubscribedApi.bind(this), this.listPagedCustomers.bind(this));
        app.get(this.url('paged/list/filter'), this.isAuthAndSubscribedApi.bind(this), this.filterCustomers.bind(this)); // filter customers
        app.get(this.url('customer/count'), this.isAuthAndSubscribedApi.bind(this), this.getCustomerCount.bind(this));
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

    refreshTemplateImage: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> refreshTemplateImage');
        var customerId = parseInt(req.params.id);        
        if(accountId === appConfig.mainAccountID) {
            manager.refreshTemplateImage(accountId, userId, customerId, function(err, updatedCustomer){
                self.log.debug(accountId, userId, '<< refreshTemplateImage');
                self.sendResultOrError(resp, err, updatedCustomer, 'Error updating template account');
            });
        } else {
            self.isOrgAdmin(accountId, userId, req, function(err, val) {
                if (val === true) {
                    var orgDomain = urlUtils.getSubdomainFromRequest(req).orgDomain;
                    manager.refreshTemplateImage(accountId, userId, customerId, function(err, updatedCustomer){
                        self.log.debug(accountId, userId, '<< refreshTemplateImage');
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

    updateCustomerOEM: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateCustomerOEM');
        var customerId = parseInt(req.params.id);
        var oem = req.body.oem;
        if(accountId === appConfig.mainAccountID) {
            manager.updateCustomerOEM(accountId, userId, customerId, oem, function(err, updatedCustomer){
                self.log.debug(accountId, userId, '<< updateCustomerOEM');
                self.sendResultOrError(resp, err, updatedCustomer, 'Error updating insights');
            });
        } else {
            self.isOrgAdmin(accountId, userId, req, function(err, val) {
                if (val === true) {
                    var orgDomain = urlUtils.getSubdomainFromRequest(req).orgDomain;
                    manager.updateCustomerOEM(accountId, userId, customerId, oem, function(err, updatedCustomer){
                        self.log.debug(accountId, userId, '<< updateCustomerOEM');
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
    },

    listPagedCustomers: function (req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var skip = parseInt(req.query['skip'] || 0);
        var limit = parseInt(req.query['limit'] || 50);
        var sortBy = req.query.sortBy || "created.date";
        var sortDir = parseInt(req.query.sortDir) || -1;
        var term = req.query.term;
        self.log.debug('>> listPagedCustomers');
        var userId = self.userId(req);

        if(accountId === appConfig.mainAccountID) {
            manager.getMainCustomers(accountId, userId, sortBy, sortDir, skip, limit, term, null, function(err, customers){
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
                        manager.getOrganizationCustomers(accountId, userId, organization.id(), sortBy, sortDir, skip, limit, term, null, function(err, customers){
                            self.log.debug(accountId, userId, '<< listAllCustomers');
                            self.sendResultOrError(resp, err, customers, 'Error listing customers');
                        });
                    } else {
                        manager.getCustomers(accountId, userId, sortBy, sortDir, skip, limit, term, null, function(err, customers){
                            self.log.debug(accountId, userId, '<< listAllCustomers');
                            self.sendResultOrError(resp, err, customers, 'Error listing customers');
                        });
                    }
                }
            });
        } else {
            manager.getCustomers(accountId, userId, sortBy, sortDir, skip, limit, term, null, function(err, customers){
                self.log.debug(accountId, userId, '<< listAllCustomers');
                self.sendResultOrError(resp, err, customers, 'Error listing customers');
            });
        }
    },

    filterCustomers: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> filterCustomers');
        var skip = parseInt(req.query.skip) || 0;
        var limit = parseInt(req.query.limit) || 0;
        var sortBy = req.query.sortBy || null;
        var sortDir = parseInt(req.query.sortDir) || null;
        var fieldSearch = req.query;
        var term = req.query.term;
        delete fieldSearch.term;
        delete fieldSearch.skip;
        delete fieldSearch.limit;
        delete fieldSearch.sortBy;
        delete fieldSearch.sortDir;
        
        /*
         * Search across the fields
         */

        if(accountId === appConfig.mainAccountID) {
            manager.getMainCustomers(accountId, userId, sortBy, sortDir, skip, limit, term, fieldSearch, function(err, customers){
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
                        manager.getOrganizationCustomers(accountId, userId, organization.id(), sortBy, sortDir, skip, limit, term, fieldSearch, function(err, customers){
                            self.log.debug(accountId, userId, '<< listAllCustomers');
                            self.sendResultOrError(resp, err, customers, 'Error listing customers');
                        });
                    } else {
                        manager.getCustomers(accountId, userId, sortBy, sortDir, skip, limit, term, fieldSearch, function(err, customers){
                            self.log.debug(accountId, userId, '<< listAllCustomers');
                            self.sendResultOrError(resp, err, customers, 'Error listing customers');
                        });
                    }
                }
            });
        } else {
            manager.getCustomers(accountId, userId, sortBy, sortDir, skip, limit, term, fieldSearch, function(err, customers){
                self.log.debug(accountId, userId, '<< listAllCustomers');
                self.sendResultOrError(resp, err, customers, 'Error listing customers');
            });
        }
       
    },
    getCustomerCount: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getCustomerCount');

        if(accountId === appConfig.mainAccountID) {
            manager.getMainCustomerCount(accountId, userId, function(err, count){
                self.log.debug(accountId, userId, '<< getCustomerCount');
                self.sendResultOrError(resp, err, {count:count}, 'Error getting customer count');
            });
        } else if(urlUtils.getSubdomainFromRequest(req).isOrgRoot === true){
            orgDao.getByOrgDomain(urlUtils.getSubdomainFromRequest(req).orgDomain, function(err, organization){
                if(err) {
                    self.log.error(accountId, userId, 'Error getting organization:', err);
                    self.wrapError(resp, 500, 'Error getting Organization', 'Error getting organization');
                } else {
                    if(organization.get('adminAccount') === accountId) {
                        manager.getOrganizationCustomerCount(accountId, userId, organization.id(), function(err, count){
                            self.log.debug(accountId, userId, '<< getCustomerCount');
                            self.sendResultOrError(resp, err, {count:count}, 'Error getting customer count');
                        });
                    } else {
                        manager.getCustomerCount(accountId, userId, function(err, count){
                            self.log.debug(accountId, userId, '<< getCustomerCount');
                            self.sendResultOrError(resp, err, {count:count}, 'Error getting customer count');
                        });
                    }
                }
            });
        } else {
            manager.getCustomerCount(accountId, userId, function(err, customers){
                self.log.debug(accountId, userId, '<< getCustomerCount');
                self.sendResultOrError(resp, err, {count:count}, 'Error getting customer count');
            });
        }
    },
});

module.exports = new api({version:'2.0'});

