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
var paymentManager = require('../../payments/payments_manager');

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
        app.get(this.url(':subdomain/:accountId/duplicate'), this.checkSubdomainDuplicacy.bind(this));
        //GET
        //app.get(this.url(''), this.isAuthApi, this.getCurrentAccount.bind(this));
        app.get(this.url(''), this.getCurrentAccount.bind(this)); //Temp Added

        app.get(this.url('billing'), this.isAuthApi.bind(this), this.getCurrentAccountBilling.bind(this));
        app.post(this.url('billing'), this.isAuthApi.bind(this), this.updateCurrentAccountBilling.bind(this));
        app.get(this.url('emailpreferences'), this.isAuthApi.bind(this), this.getCurrentAccountEmailPreferences.bind(this));
        app.post(this.url('emailpreferences'), this.isAuthApi.bind(this), this.updateCurrentAccountEmailPreferences.bind(this));
        app.get(this.url(':id'), this.isAuthApi.bind(this), this.getAccountById.bind(this));
        app.post(this.url(''), this.isAuthApi.bind(this), this.createAccount.bind(this));
        app.put(this.url(':id'), this.isAuthApi.bind(this), this.updateAccount.bind(this));
        app.put(this.url(':id/displaysetting'), this.isAuthApi.bind(this), this.updateAccountDisplaySetting.bind(this));
        app.put(this.url(':id/setting'), this.isAuthApi.bind(this), this.updateAccountSetting.bind(this));
        app.put(this.url(':id/website'), this.isAuthApi.bind(this), this.updateAccountWebsiteInfo.bind(this));

        app.delete(this.url(':id'), this.isAuthApi.bind(this), this.deleteAccount.bind(this));

        app.get(this.url(':userid/accounts', 'user'), this.isAuthApi.bind(this), this.getAllAccountsForUserId.bind(this));


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
                        billingObj = _.extend(account.get('billing'), billingObj);
                        account.set('billing', billingObj);
                        accountDao.saveOrUpdate(account, function(err, updatedAccount){
                            if(err) {
                                self.log.error('Exception updating billing object on account: ' + err);
                                return self.wrapError(res, 500, null, err, err);
                            } else {
                                if(billingObj.cardToken && billingObj.stripeCustomerId) {
                                    //we need to add a cardToken to a customer
                                    paymentManager.addCardToCustomer(billingObj.cardToken, billingObj.stripeCustomerId, function(err, value){
                                        if(err) {
                                            self.log.error('Error updating Stripe');
                                            res.send(updatedAccount);
                                        } else {
                                            //check if we need to update the subscription
                                            if(!billingObj.subscriptionId) {
                                                self.log.debug('Attempting to resubscribe');
                                                var stripeCustomerId = billingObj.stripeCustomerId;
                                                var plan = billingObj.plan;
                                                var userId = self.userId(req);
                                                var coupon = billingObj.coupon;
                                                var setupFee = billingObj.setupFee;
                                                paymentManager.createStripeSubscription(stripeCustomerId, plan,
                                                    account.id(), userId, coupon, setupFee, function(err, sub) {
                                                        if(err) {
                                                            self.log.error('Error subscribing: ', err);
                                                            res.send(updatedAccount);
                                                        } else {
                                                            delete billingObj.setupFee;
                                                            billingObj.subscriptionId = sub.id;
                                                            account.set('billing', billingObj);
                                                            account.set('locked_sub', false);
                                                            accountDao.saveOrUpdate(account, function(err, newUpdatedAccount) {
                                                                if (err) {
                                                                    self.log.error('Error updating account with sub: ' + err);
                                                                    res.send(updatedAccount);
                                                                } else {
                                                                    self.sm.addSubscriptionToAccount(accountId, sub.id, plan, userId, function(err, value){
                                                                        //TODO: fix session
                                                                        self.log.debug('<< updateCurrentAccountBilling');
                                                                        res.send(newUpdatedAccount);
                                                                        self.createUserActivity(req, 'MODIFY_ACCOUNT_BILLING', null, null, function(){});
                                                                        return;
                                                                    });

                                                                }
                                                            });
                                                        }
                                                    });
                                            } else {
                                                self.log.debug('<< updateCurrentAccountBilling');
                                                res.send(updatedAccount);
                                                self.createUserActivity(req, 'MODIFY_ACCOUNT_BILLING', null, null, function(){});
                                                return;
                                            }
                                        }

                                    });
                                } else {
                                    //we're done here.
                                    self.log.debug('<< updateCurrentAccountBilling');
                                    res.send(updatedAccount);
                                    self.createUserActivity(req, 'MODIFY_ACCOUNT_BILLING', null, null, function(){});
                                    return;
                                }


                            }
                        });
                    }
                });
            }
        });

    },

    getCurrentAccountEmailPreferences: function(req, resp){
        var self = this;
        self.log.debug('>> getCurrentAccountEmailPreferences');
        var accountId = self.accountId(req);
        self.checkPermissionForAccount(req, self.sc.privs.VIEW_ACCOUNT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                accountDao.getAccountByID(accountId, function(err, account){
                    if(err || account===null) {
                        self.log.error('error getting current account: ' + err);
                        return self.wrapError(resp, 500, null, err, account);
                    } else {
                        var emailPreferences = account.get('email_preferences');
                        if(emailPreferences !== null) {
                            self.log.debug('<< getCurrentAccountEmailPreferences');
                            return resp.send(emailPreferences);
                        } else {
                            var defaultPreferences = new $$.m.Account({}).get('email_preferences');
                            account.set('email_preferences', defaultPreferences);
                            accountDao.saveOrUpdate(account, function(err, savedAccount){
                                if(err) {
                                    self.log.error('Error updating account with default prefs', err);
                                    return self.wrapError(resp, 500, null, err, savedAccount);
                                } else {
                                    self.log.debug('<< getCurrentAccountEmailPreferences');
                                    return resp.send(defaultPreferences);
                                }
                            });
                        }

                    }
                });

            }
        });

    },

    updateCurrentAccountEmailPreferences: function(req, resp) {
        var self = this;
        self.log.debug('>> updateCurrentAccountEmailPreferences');
        var accountId = self.accountId(req);
        self.checkPermissionForAccount(req, self.sc.privs.MODIFY_ACCOUNT, accountId, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {
                var emailPreferences = req.body;
                accountDao.getAccountByID(accountId, function(err, account) {
                    if (err || account === null) {
                        self.log.error('error getting current account: ' + err);
                        return self.wrapError(resp, 500, null, err, account);
                    } else {
                        account.set('email_preferences', emailPreferences);
                        accountDao.saveOrUpdate(account, function(err, savedAccount){
                            if(err) {
                                self.log.error('Error updating account prefs', err);
                                return self.wrapError(resp, 500, null, err, savedAccount);
                            } else {
                                self.log.debug('<< updateCurrentAccountEmailPreferences');
                                return resp.send(account.get('email_preferences'));
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
        var self = this;
        self.log.debug('>> updateAccount');
        var account = new $$.m.Account(req.body);

        self.checkPermission(req, self.sc.privs.MODIFY_ACCOUNT, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                accountDao.saveOrUpdate(account, function(err, value){
                    if(!err &&value != null){
                        self.log.debug('<< updateAccount');
                        resp.send(value.toJSON("public"));
                        self.createUserActivity(req, 'MODIFY_ACCOUNT', null, null, function(){});
                    } else {
                        self.log.error('Error updating account: ' + err);
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
                                self.createUserActivity(req, 'MODIFY_ACCOUNT', null, null, function(){});
                                return resp.send(value.toJSON("public"));
                            } else {
                                return self.wrapError(resp, 500, null, err, value);
                            }
                        });
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
                                self.createUserActivity(req, 'MODIFY_ACCOUNT', null, null, function(){});
                                return resp.send(value.toJSON("public"));
                            } else {
                                return self.wrapError(resp, 500, null, err, value);
                            }
                        });
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
                                self.createUserActivity(req, 'MODIFY_ACCOUNT', null, null, function(){});
                                return resp.send(value.toJSON("public"));
                            } else {
                                return self.wrapError(resp, 500, null, err, value);
                            }
                        });
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
                            self.createUserActivity(req, 'DELETE_ACCOUNT', null, null, function(){});
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

    _createTmpAccount: function(resp, cb) {
        var self = this;
        var tmpAccount = new $$.m.Account({
            token: $$.u.idutils.generateUUID()
        });
        accountDao.saveOrUpdateTmpAccount(tmpAccount, function(err, val){
            if(err) {
                self.log.error('Error creating temp account: ' + err);
                cb();
            } else {
                cookies.setAccountToken(resp, val.get('token'));
                cb();
            }
        });
    },

    saveOrUpdateTmpAccount: function(req,resp) {
        var self = this;
        self.log.debug('>> saveOrUpdateTmpAccount');

        var account = new $$.m.Account(req.body);
        var subdomain = account.get('subdomain').toLowerCase();
        subdomain = subdomain.replace(/([^a-zA-Z0-9_-])+/gi, '');
        account.set('subdomain', subdomain);
        self.log.debug('subdomain is now: ' + account.get('subdomain'));
        accountDao.saveOrUpdateTmpAccount(account, function(err, value) {
           if (!err && value != null) {
               cookies.setAccountToken(resp, value.get("token"));
               self.log.debug('<< saveOrUpdateTmpAccount(' + value.get('token') + ')', value);
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
        var subdomain = req.params.subdomain.toLowerCase();
        accountDao.getAccountBySubdomain(subdomain, function(err, value){
            if(err) {
                res.wrapError(res,500,null,err,value);
            } else if(value === null) {
                if(cookies.getAccountToken(req) === undefined) {
                    self.log.debug('Creating tmp account');
                    self._createTmpAccount(res, function(){
                        res.send('true');
                    });
                } else {
                    res.send('true');
                }
            } else {
                res.send('false');
            }
        });

    },

    checkSubdomainDuplicacy: function(req, res) {
        var self = this;
        self.log.debug('>> checkSubdomainDuplicacy');
        var subdomain = req.params.subdomain;
        var accountId = req.params.accountId;
        accountId = parseInt(accountId);
        self.log.debug('>> subdomain = ' + subdomain );
        self.log.debug('>> accountId = ' + accountId );

        accountDao.getAccountsBySubdomain(subdomain, accountId, function(err, value){
            if(err) {
                res.wrapError(res,500,null,err,value);
            } else if(value === null) {
                res.send("false");
            } else {
                res.send("true");
            }
        });

    }
});

module.exports = new api();

