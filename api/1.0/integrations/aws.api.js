/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../../base.api.js');
var s3Dao = require('../../../dao/integrations/s3.dao.js');
var route53Dao = require('../../../dao/integrations/route53.dao');
var accountDao = require('../../../dao/account.dao');
var async = require('async');

var api = function () {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "integrations/aws",

    dao: s3Dao,

    initialize: function () {
        //GET
        app.get(this.url("credentials/download/:bucket/:resource"), this.isAuthApi.bind(this), this.getSignedRequest.bind(this));
        app.get(this.url("credentials/upload/:bucket/:filename"), this.isAuthApi.bind(this), this.getS3UploadCredentials.bind(this));
        app.get(this.url('route53/:name/available'), this.isAuthApi.bind(this), this.checkDomainAvailability.bind(this));
        app.get(this.url('route53/:domain/nameservers'), this.isAuthApi.bind(this), this.getNameServers.bind(this));
        app.put(this.url('route53/:domain/account/:accountId'), this.isAuthApi.bind(this), this.addDomainConfig.bind(this));
    },


    getSignedRequest: function (req, resp) {
        var bucket = req.params.bucket;
        var resource = req.params.resource;

        var url = s3Dao.getSignedRequest(bucket, resource);
        resp.send(url);
    },


    getS3UploadCredentials: function (req, resp) {
        var self = this;
        var filename = req.params.filename;
        var bucket = req.params.bucket;
        var redirect = req.query.redirect;
        if (redirect == null || redirect == "") {
            redirect = req.headers.referer;
        }

        if (!bucket) {
            this.wrapError(resp, 400, null, "Invalid parameter for S3 Bucket");
            self = req = resp = null;
        }

        var credentials = s3Dao.getS3UploadCredentials(bucket, filename, redirect);
        resp.send(credentials);
        self = req = resp = null;
    },

    checkDomainAvailability: function(req, resp) {
        var self = this;
        self.log.debug('>> checkDomainAvailability');

        var name = req.params.name;

        route53Dao.checkDomainAvailability(name, function(err, value){
            self.log.debug('<< checkDomainAvailability');
            self.sendResultOrError(resp, err, value, 'Error checking availability');
        });
    },

    getNameServers: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getNameServers');
        var domain = req.params.domain;
        route53Dao.getNameServers(accountId, userId, domain, function(err, value){
            self.log.debug(accountId, userId, '<< getNameServers');
            self.sendResultOrError(resp, err, value, 'Error checking nameservers');
        });

    },

    addDomainConfig: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> addDomainConfig');
        self._isAdmin(req, function(err, value) {
            if (value !== true) {
                return self.send403(resp);
            } else {
                var domain = req.params.domain;
                var indiAccountId = parseInt(req.params.accountId);
                async.waterfall([
                    function(cb) {
                        accountDao.getAccountByID(indiAccountId, function(err, account){
                            if(err) {
                                self.log.error('Error finding account', err);
                                cb(err);
                            } else if(!account) {
                                self.log.error('Error finding account', err);
                                cb('Unable to find account');
                            } else {
                                cb(null, account);
                            }
                        });
                    },
                    function(account, cb) {
                        route53Dao.addDomainConfig(accountId, userId, domain, indiAccountId, account.get('subdomain'), function(err, value){
                            if(err) {
                                self.log.error('Error adding domain:', err);
                                cb(err);
                            } else {
                                cb(null, account, value);
                            }
                        });
                    },
                    function(account, zone, cb) {
                        account.set('customDomain', domain);
                        account.set('modified', {date:new Date(), by:userId});
                        accountDao.saveOrUpdate(account, function(err, updatedAccount){
                            if(err) {
                                self.log.error('Error saving domain to account:', err);
                                cb(err);
                            } else {
                                cb(null, zone);
                            }
                        });
                    }
                ], function(err, value){
                    self.log.debug(accountId, userId, '<< addDomainConfig');
                    self.sendResultOrError(resp, err, value, 'Error adding domain');
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

return new api();