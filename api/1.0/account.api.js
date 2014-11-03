/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var accountDao = require('../../dao/account.dao');
var cookies = require('../../utils/cookieutil');
var Account = require('../../models/account');
var userDao = require('../../dao/user.dao');
var appConfig = require('../../configs/app.config');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "account",

    dao: accountDao,

    initialize: function() {
        //TMP Accont
        app.get(this.url('tmp'), this.getTempAccount.bind(this));
        app.post(this.url('tmp'), this.saveOrUpdateTmpAccount.bind(this));
        app.put(this.url('tmp'), this.saveOrUpdateTmpAccount.bind(this));
        app.get(this.url(':subdomain/available'), this.checkSubdomainAvailability.bind(this));
        //GET
        //app.get(this.url(''), this.isAuthApi, this.getCurrentAccount.bind(this));
        app.get(this.url(''), this.getCurrentAccount.bind(this)); //Temp Added

        app.get(this.url('billing'), this.isAuthApi, this.getCurrentAccountBilling.bind(this));
        app.post(this.url('billing'), this.isAuthApi, this.updateCurrentAccountBilling.bind(this));
        app.get(this.url(':id'), this.isAuthApi, this.getAccountById.bind(this));
        app.post(this.url(''), this.isAuthApi, this.createAccount.bind(this));
        app.put(this.url(':id'), this.isAuthApi, this.updateAccount.bind(this));
        app.put(this.url(':id/displaysetting'), this.isAuthApi, this.updateAccountDisplaySetting.bind(this));
        app.put(this.url(':id/setting'), this.isAuthApi, this.updateAccountSetting.bind(this));
        app.put(this.url(':id/website'), this.isAuthApi, this.updateAccountWebsiteInfo.bind(this));

        app.delete(this.url(':id'), this.isAuthApi, this.deleteAccount.bind(this));

        app.get(this.url(':userid/accounts', 'user'), this.isAuthApi, this.getAllAccountsForUserId.bind(this));


    },


    getCurrentAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> getCurrentAccount');
        accountDao.getAccountByHost(req.get("host"), function(err, value) {
            if (!err) {
                if (value == null) {
                    self.log.debug('<< getCurrentAccount');
                    return resp.send({});
                } else {
                    self.log.debug('<< getCurrentAccount');
                    //no security for now.  Currently can be called without authentication.
                    //return self.checkPermissionAndSendResponse(req, self.sc.privs.VIEW_ACCOUNT, resp, value.toJSON('public'));
                    return resp.send(value.toJSON('public'));
                }
            } else {
                return self.wrapError(resp, 500, null, err, value);
            }
        });
    },

    getCurrentAccountBilling: function(req, res) {
        var self = this;
        self.log.debug('>> getCurrentAccountBilling');
        var accountId = self.accountId(req);
        accountDao.getAccountByID(accountId, function(err, account){
            if(err || account===null) {
                self.log.debug('<< getCurrentAccountBilling');
                return self.wrapError(res, 500, null, err, account);
            } else {
                self.log.debug('<< getCurrentAccountBilling');
                return self.checkPermissionAndSendResponse(req, self.sc.privs.VIEW_ACCOUNT, resp, account.get('billing'));
                //return res.send(account.get('billing'));
            }
        });
    },

    updateCurrentAccountBilling: function(req, res) {
        var self = this;
        self.log.debug('>> updateCurrentAccountBilling');
        var accountId = self.accountId(req);
        self.checkPermission(req, self.sc.privs.MODIFY_ACCOUNT, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(res);
            } else {
                var userId = self.userId(req);
                var billingObj = req.body;
                billingObj.userId = userId;
                accountDao.getAccountByID(accountId, function(err, account){
                    if(err) {
                        self.log.error('Exception retrieving current account: ' + err);
                        return self.wrapError(res, 500, null, err, err);
                    } else {
                        account.set('billing', billingObj);
                        accountDao.saveOrUpdate(account, function(err, updatedAccount){
                            if(err) {
                                self.log.error('Exception updating billing object on account: ' + err);
                                return self.wrapError(res, 500, null, err, err);
                            } else {
                                self.log.debug('<< updateCurrentAccountBilling');
                                return res.send(updatedAccount);
                            }
                        });
                    }
                });
            }
        });

    },


    getAccountById: function(req,resp) {

        var self = this;
        var accountId = req.params.id;

        if (!accountId) {
            this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }

        accountId = parseInt(accountId);
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_ACCOUNT, accountId, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                accountDao.getById(accountId, function(err, value) {
                    if (!err && value != null) {
                        resp.send(value.toJSON("public"));
                    } else {
                        self.wrapError(resp, 500, null, err, value);
                    }
                });
            }
        });

    },


    getAllAccountsForUserId: function(req,resp) {
        var self = this;
        var userId = req.params.userid;

        if (!userId) {
            this.wrapError(resp, 400, null, "Invalid parameter for UserId");
        }

        userId = parseInt(userId);

        accountDao.getAllAccountsForUserId(userId, function(err, value) {
            if (!err) {
                //TODO: Do we need to filter out values that the requestor can't see?
                self.checkPermissionAndSendResponse(req, self.sc.privs.VIEW_USER, resp, value);
                //self.sendResult(resp, value);
            } else {
                self.wrapError(resp, 500, null, err, value);
            }
        });
    },


    createAccount: function(req,resp) {

    },



    updateAccount: function(req,resp) {
        var account = new $$.m.Account(req.body);

        self.checkPermission(req, self.sc.privs.MODIFY_ACCOUNT, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                accountDao.saveOrUpdate(account, function(err, value){
                    if(!err &&value != null){
                        resp.send(value.toJSON("public"));
                    } else {
                        self.wrapError(resp, 500, null, err, value);
                    }
                });
            }
        });

    },

    updateAccountDisplaySetting: function(req,resp) {
        console.log(req.body);
        var account=req.body;
        var self = this;
        var accountId = req.params.id;

        if (!accountId) {
            this.wrapError(resp, 400, null, "Invalid paramater for ID");
        }

        accountId = parseInt(accountId);

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_ACCOUNT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                accountDao.getById(accountId, function(err, value) {
                    if (!err && value != null) {
                        value.set("displaysettings", account.display_type );
                        accountDao.saveOrUpdate(value, function(err, value) {
                            console.log(value);
                            if (!err && value != null) {
                                resp.send(value.toJSON("public"));
                            } else {
                                self.wrapError(resp, 500, null, err, value);
                            }
                        });
                        resp.send(value.toJSON("public"));
                    } else {
                        self.wrapError(resp, 500, null, err, value);
                    }
                });
            }
        });

    },
    updateAccountSetting: function(req,resp) {
        console.log(req.body);
        var account=req.body;
        var self = this;
        var accountId = req.params.id;

        if (!accountId) {
            this.wrapError(resp, 400, null, "Invalid paramater for ID");
        }

        accountId = parseInt(accountId);

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_ACCOUNT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                accountDao.getById(accountId, function(err, value) {
                    if (!err && value != null) {
                        value.set("settings", account.sort_type );
                        accountDao.saveOrUpdate(value, function(err, value) {
                            console.log(value);
                            if (!err && value != null) {
                                resp.send(value.toJSON("public"));
                            } else {
                                self.wrapError(resp, 500, null, err, value);
                            }
                        });
                        resp.send(value.toJSON("public"));
                    } else {
                        self.wrapError(resp, 500, null, err, value);
                    }
                });
            }
        });

    },

    updateAccountWebsiteInfo: function(req,resp) {
        console.log(req.body);
        var account=req.body;
        var self = this;
        var accountId = req.params.id;

        if (!accountId) {
            this.wrapError(resp, 400, null, "Invalid paramater for ID");
        }

        accountId = parseInt(accountId);

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_ACCOUNT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                accountDao.getById(accountId, function(err, value) {
                    if (!err && value != null) {
                        value.set("website",{themeId:account.website.themeId, websiteId:value.get("website").websiteId});
                        accountDao.saveOrUpdate(value, function(err, value) {
                            console.log(value);
                            if (!err && value != null) {
                                resp.send(value.toJSON("public"));
                            } else {
                                self.wrapError(resp, 500, null, err, value);
                            }
                        });
                        resp.send(value.toJSON("public"));
                    } else {
                        self.wrapError(resp, 500, null, err, value);
                    }
                });
            }
        });


    },


    deleteAccount: function(req,res) {
        var self = this;
        self.log.debug('>> deleteAccount');

        var accountId = parseInt(self.accountId(req));
        var accountIdParam = parseInt(req.params.id);

        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_ACCOUNT, accountIdParam, function(err, isAllowed){
                if (isAllowed !== true) {
                    return self.send403(res);
                } else {
                    //make sure we are not trying to delete main
                    if(accountIdParam === appConfig.mainAccountID) {
                        self.log.warn('Attempt to delete main denied.  This must be done manually.');
                        self.wrapError(res, 401, null, 'Unauthorized', 'You are not authorized to perform this operation');
                    } else if(accountId === accountIdParam || accountId === appConfig.mainAccountID) {
                        accountDao.deleteAccountAndArtifacts(accountIdParam, function(err, value){
                            self.log.debug('<< deleteAccount');
                            self.send200(res);
                        });
                    } else {
                        self.log.debug('<< deleteAccount');
                        self.wrapError(res, 401, null, 'Unauthorized', 'You are not authorized to perform this operation');
                    }
                }
        });

    },


    getTempAccount: function(req,resp) {

        var self = this;
        self.log.debug(' getTempAccount >>>');
        var token = cookies.getAccountToken(req);

        accountDao.getTempAccount(token, function(err, value) {
            if (!err) {
                if (value != null) {
                    resp.send(value.toJSON("public"));
                } else {
                    resp.send({});
                }
            } else {
                resp.wrapError(resp, 500, null, err, value);
            }
        })
    },


    saveOrUpdateTmpAccount: function(req,resp) {
        var self = this;
        self.log.debug('>> saveOrUpdateTmpAccount');

        var account = new $$.m.Account(req.body);

        accountDao.saveOrUpdateTmpAccount(account, function(err, value) {
           if (!err && value != null) {
               cookies.setAccountToken(resp, value.get("token"));
               self.log.debug('<< saveOrUpdateTmpAccount')
               resp.send(value.toJSON("public"));
           } else {
               self.wrapError(resp, 500, null, err, value);
           }
        });
    },

    getAccountBySubdomain:function(req,resp){
           accountDao.getAccountBySubdomain(req.query.subdomain,function(err,value){
            if(!err){
               if(value!=null)
                  resp.send(value.toJSON("public"));
               else
                  resp.send({});
            }
            else{
                  resp.wrapError(resp,500,null,err,value);
            }
        });
    },

    checkSubdomainAvailability: function(req, res) {
        var self = this;
        self.log.debug('>> checkSubdomainAvailability');
        var subdomain = req.params.subdomain;
        accountDao.getAccountBySubdomain(subdomain, function(err, value){
            if(err) {
                res.wrapError(resp,500,null,err,value);
            } else if(value === null) {
                res.send('true');
            } else {
                res.send('false');
            }
        });

    }
});

module.exports = new api();

