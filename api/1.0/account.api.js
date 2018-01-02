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
var productManager = require('../../products/product_manager');
var emailMessageManager = require('../../emailmessages/emailMessageManager');
var notificationConfig = require('../../configs/notification.config');
var userManager = require('../../dao/user.manager');
var moment = require('moment');
var accountManager = require('../../accounts/account.manager');
var orgManager = require('../../organizations/organization_manager');
var utils = require('../../utils/commonutils');

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
        app.get(this.url(':subdomain/duplicate'), this.checkSubdomainDuplicacyAdmin.bind(this));

        //GET
        //app.get(this.url(''), this.isAuthApi, this.getCurrentAccount.bind(this));
        app.get(this.url(''), this.setup.bind(this), this.getCurrentAccount.bind(this));
        app.get(this.url('organization'), this.isAuthApi.bind(this), this.getCurrentOrganization.bind(this));

        app.get(this.url('billing'), this.isAuthApi.bind(this), this.getCurrentAccountBilling.bind(this));
        app.post(this.url('billing'), this.isAuthApi.bind(this), this.updateCurrentAccountBilling.bind(this));
        app.get(this.url('emailpreferences'), this.isAuthApi.bind(this), this.getCurrentAccountEmailPreferences.bind(this));
        app.post(this.url('emailpreferences'), this.isAuthApi.bind(this), this.updateCurrentAccountEmailPreferences.bind(this));
        app.get(this.url('users'), this.isAuthAndSubscribedApi.bind(this), this.listUsersForAccount.bind(this));
        app.get(this.url('templates'), this.setup.bind(this), this.listAccountTemplates.bind(this));
        app.get(this.url('owner'), this.setup.bind(this), this.getOwnerUser.bind(this));
        app.post(this.url('activate'), this.setup.bind(this), this.activateAccount.bind(this));
        app.post(this.url('email/dev'), this.setup.bind(this), this.sendEmailToDevs.bind(this));

        app.get(this.url(':id'), this.isAuthApi.bind(this), this.getAccountById.bind(this));
        app.post(this.url(''), this.isAuthApi.bind(this), this.createAccount.bind(this));
        app.put(this.url(':id'), this.isAuthApi.bind(this), this.updateAccount.bind(this));
        app.put(this.url(':id/displaysetting'), this.isAuthApi.bind(this), this.updateAccountDisplaySetting.bind(this));
        app.put(this.url(':id/setting'), this.isAuthApi.bind(this), this.updateAccountSetting.bind(this));
        app.put(this.url(':id/website'), this.isAuthApi.bind(this), this.updateAccountWebsiteInfo.bind(this));
        app.post(this.url(':id/copy'), this.isAuthApi.bind(this), this.copyTemplateAccount.bind(this));
        app.get(this.url(':id/copy'), this.isAuthApi.bind(this), this.testCopyTemplateAccount.bind(this));




        app.delete(this.url(':id'), this.isAuthApi.bind(this), this.deleteAccount.bind(this));

        app.get(this.url(':userid/accounts', 'user'), this.isAuthApi.bind(this), this.getAllAccountsForUserId.bind(this));
        app.post(this.url('user'), this.isAuthApi.bind(this), this.createUserForAccount.bind(this));
        app.delete(this.url('user/:userId'), this.isAuthApi.bind(this), this.removeUserFromAccount.bind(this));
        app.post(this.url('user/:id/password'), this.isAuthApi.bind(this), this.setUserPassword.bind(this));
        app.post(this.url('copyUser/:userId'), this.isAuthApi.bind(this), this.addUserToAccount.bind(this));


    },

    listUsersForAccount: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listUsersForAccount');


        self.checkPermission(req, self.sc.privs.MODIFY_ACCOUNT, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(res);
            } else {
                userManager.getUserAccounts(accountId, true, function(err, users){
                    self.log.debug(accountId, userId, '<< listUsersForAccount');
                    return self.sendResultOrError(resp, err, users, 'Error listing users', null);
                });
            }
        });
    },

    getOwnerUser: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.currentAccountId(req));
        var userId = null;
        self.log.debug(accountId, userId, '>> getOwnerUser');
        self.getOrgId(accountId, userId, req, function(err, orgId){
            if(orgId && orgId === 5) {
                accountManager.getOwnerUsername(accountId, userId, orgId, function(err,username){
                    return self.sendResultOrError(resp, err, username, 'Error getting username');
                });
            } else {
                self.log.debug('orgId:', orgId);
                self.send403(resp);
            }
        });
    },


    createUserForAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> createUserForAccount');

        var accountId = parseInt(self.accountId(req));
        var username = req.body.username;
        var password = req.body.password;
        var email = req.body.username;
        var roleAry = ['super','admin','member'];
        if(req.body.roleAry){
            if(!_.isArray(req.body.roleAry)){
                roleAry = req.body.roleAry.split(',');
            } else {
                roleAry = req.body.roleAry;
            }
        }
        var params = _.omit(req.body, ['username', 'password', 'roleAry']);

        var callingUser = parseInt(self.userId(req));
        self.checkPermission(req, self.sc.privs.MODIFY_ACCOUNT, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                userManager.createUser(accountId, username, password, email, roleAry, callingUser, params, function(err, user){
                    if(err) {
                        self.log.error('Error creading user for account:', err);
                        return self.wrapError(resp, 500, null, err, null);
                    } else {
                        self.log.debug('<< createUserForAccount');
                        var _user = user.toJSON('manage', {accountId:accountId});
                        return self.sendResultOrError(resp, err, _user, 'Error creating user', null);
                    }

                });
            }
        });

    },

    removeUserFromAccount: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = parseInt(req.params.userId);
        self.log.debug(accountId, userId, '>> removeUserFromAccount');



        self.checkPermission(req, self.sc.privs.MODIFY_ACCOUNT, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                userManager.deleteOrRemoveUserForAccount(accountId, userId, function(err, value){
                    self.log.debug(accountId, userId, '<< removeUserFromAccount');
                    return self.sendResultOrError(resp, err, value, 'Error removing user from account', null);
                });
            }
        });
    },


    setUserPassword: function(req, resp) {
        var self = this;
        self.log.debug('>> setUserPassword');

        self.checkPermission(req, self.sc.privs.MODIFY_ACCOUNT, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(resp);
            } else {
                var newPassword = req.body.password;
                var userId = parseInt(req.params.id);
                userManager.setUserPassword(userId, newPassword, self.userId(req), function(err, user){
                    if(err) {
                        self.log.error('Error setting password:', err);
                        self.wrapError(resp, 500, 'Error modifying password', err, null);
                    } else {
                        self.log.debug('<< setUserPassword');
                        self.sendResult(resp, user);
                    }
                });
            }
        });


    },

    getCurrentOrganization: function(req, resp) {
        var self = this;
        var userId = self.userId(req);
        var accountId = parseInt(self.accountId(req));
        self.log.debug(accountId, userId, '>> getCurrentOrganization');
        self.checkPermission(req, self.sc.privs.MODIFY_ACCOUNT, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                accountManager.getOrganizationByAccountId(accountId, userId, function(err, org){
                    self.log.debug(accountId, userId, '<< getCurrentOrganization');
                    self.sendResultOrError(resp, err, org, "Error finding organization");
                });
            }
        });

    },

    /**
     * No security here
     * @param req
     * @param resp
     */
    getCurrentAccount: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.currentAccountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getCurrentAccount');
        accountDao.getAccountByHost(req.get("host"), function(err, value) {
            if (!err) {
                if (value == null) {
                    self.log.debug(accountId, userId, '<< getCurrentAccount');
                    return resp.send({});
                } else {
                    accountManager.getOrganizationById(accountId, userId, value.get('orgId'), function(err, organization){
                        self.log.debug(accountId, userId, '<< getCurrentAccount');
                        self._addTrialDaysToAccount(value);
                        if(accountId !== appConfig.mainAccountID) {
                            self.sm.verifySubscriptionWithoutSettingSessionVariables(req, accountId, function(err, isValid){
                                if(isValid === false && accountId !== appConfig.mainAccountID) {
                                    value.set('locked_sub', true);
                                }
                                var json = value.toJSON('public');
                                if(organization && value.id() === organization.get('adminAccount')) {
                                    json.isOrgAdmin = true;
                                }
                                return resp.send(json);
                            });
                        } else {
                            var json = value.toJSON('public');
                            if(organization && value.id() === organization.get('adminAccount')) {
                                json.isOrgAdmin = true;
                            }
                            return resp.send(json);
                        }
                    });


                }
            } else {
                return self.wrapError(resp, 500, null, err, value);
            }
        });
    },

    getCurrentAccountBilling: function(req, res) {
        var self = this;
        self.log.debug('>> getCurrentAccountBilling');
        var accountId = parseInt(self.accountId(req));
        accountDao.getAccountByID(accountId, function(err, account){
            if(err || account===null) {
                self.log.debug('<< getCurrentAccountBilling');
                return self.wrapError(res, 500, null, err, account);
            } else {
                self.log.debug('<< getCurrentAccountBilling');
                return self.checkPermissionAndSendResponse(req, self.sc.privs.VIEW_ACCOUNT, res, account.get('billing'));
                //return res.send(account.get('billing'));
            }
        });
    },

    updateCurrentAccountBilling: function(req, res) {
        var self = this;
        var accountId = self.accountId(req);
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateCurrentAccountBilling');

        self.checkPermission(req, self.sc.privs.MODIFY_ACCOUNT, function(err, isAllowed){
            if(isAllowed !== true) {
                return self.send403(res);
            } else {
                var billingObj = req.body;
                billingObj.userId = userId;
                accountDao.getAccountByID(accountId, function(err, account){
                    if(err) {
                        self.log.error('Exception retrieving current account: ' + err);
                        return self.wrapError(res, 500, null, err, err);
                    } else {
                        billingObj = _.extend(account.get('billing'), billingObj);
                        account.set('billing', billingObj);
                        account.set('modified', {date:new Date(), by:userId});
                        accountDao.saveOrUpdate(account, function(err, updatedAccount){
                            if(err) {
                                self.log.error('Exception updating billing object on account: ' + err);
                                return self.wrapError(res, 500, null, err, err);
                            } else {
                                if(billingObj.cardToken && billingObj.stripeCustomerId) {
                                    //we need to add a cardToken to a customer
                                    if(account.get('orgId') > 0) {
                                        self._getOrgAccessToken(accountId, userId, account.get('orgId'), function(err, accessToken){
                                            paymentManager.addCardUpdateDefaultAndAttemptPayment(accountId, userId, billingObj.cardToken, billingObj.stripeCustomerId, accessToken, function(err, value){
                                                if(err) {
                                                    self.log.error(accountId, userId, 'Error updating Stripe');
                                                    return self.wrapError(res, 500, null, err.message, err.message);
                                                } else {
                                                    self.log.debug(accountId, userId, '<< updateCurrentAccountBilling');
                                                    updatedAccount.set('invoice', value);
                                                    res.send(updatedAccount);
                                                    self.createUserActivity(req, 'MODIFY_ACCOUNT_BILLING', null, null, function(){});
                                                }
                                            });
                                        });
                                    } else {
                                        paymentManager.addCardUpdateDefaultAndAttemptPayment(accountId, userId, billingObj.cardToken, billingObj.stripeCustomerId, null, function(err, value){
                                            if(err) {
                                                self.log.error(accountId, userId, 'Error updating Stripe');
                                                return self.wrapError(res, 500, null, err.message, err.message);
                                            } else {
                                                self.log.debug(accountId, userId, '<< updateCurrentAccountBilling');
                                                updatedAccount.set('invoice', value);
                                                res.send(updatedAccount);
                                                self.createUserActivity(req, 'MODIFY_ACCOUNT_BILLING', null, null, function(){});
                                            }
                                        });
                                    }


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
                        self._addTrialDaysToAccount(value);
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

    activateAccount: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.currentAccountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> activateAccount');
        self.getOrgId(accountId, userId, req, function(err, orgId){
            var username = req.body.username;
            var password = req.body.password;
            var templateId = req.body.templateId;
            accountManager.activateAccount(accountId, userId, orgId, username, password, templateId, function(err, account){
                self.log.debug(accountId, userId, '<< activateAccount');
                req.session.activated=true;
                var key = 'host_' + req.get('host');
                $$.g.cache.remove(key);
                self.sendResultOrError(resp, err, account, "Error creating account");
            });
        });
    },

    sendEmailToDevs: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.currentAccountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> sendEmailToDevs');

        var script = req.body.script;
        var emailTo = req.body.emailTo;

        var component = {};
        component.script = script;
        var fromEmail = notificationConfig.ACTIVATE_ACCOUNT_FROM_EMAIL;
        var fromName =  notificationConfig.ACTIVATE_ACCOUNT_FROM_Name;
        var emailSubject = notificationConfig.ACTIVATE_ACCOUNT_EMAIL_SUBJECT;
        accountDao.getAccountByID(accountId, function(err, account){
            if(account && account.get('business') && account.get('business').name) {
                fromName = account.get('business').name;
            }
            app.render('emails/send_email_to_developer', component, function(err, html){
                if(err) {
                    self.log.error('error rendering html: ' + err);
                    self.log.warn('email will not be sent to configured email.');
                } else {
                    console.log(html);
                    //var emailToArray = quote.get("recipients");
                   // if(emailToArray && emailToArray.length){
                        //_.each(emailToArray, function(emailTo){
                            emailMessageManager.sendBasicDetailsEmail(fromEmail, fromName, emailTo, null, emailSubject, html, accountId, [], '', null, null, function(err, result){

                                self.sendResultOrError(resp, err, result, "Error sending email");
                            });
                       // })
                    //}
                }
            });
        });
    },


    createAccount: function(req,resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> createAccount');
        var orgId = 0;
        if(req.body.orgId) {
            orgId = parseInt(req.body.orgId);
        }
        var subdomain = req.body.subdomain;
        var username = req.body.username;
        var password = req.body.password;
        if(username) {
            username = username.toLowerCase();
        }
        var billing = {plan:'NO_PLAN_ARGUMENT', signupDate:new Date(), trialLength:31};

        if(req.body.billing) {
            //TODO: handle billing
        }
        var oem = false;
        if(req.body.oem && req.body.oem == true) {
            oem = true;
        }
        var passkey = req.body.passkey;

        accountManager.createAccount(accountId, userId, orgId, subdomain, username, password, billing, oem, passkey, function(err, account){
            self.log.debug(accountId, userId, '<< createAccount', account);
            self.sendResultOrError(resp, err, account, "Error creating account");
        });

    },



    updateAccount: function(req,resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateAccount');
        var account = new $$.m.Account(req.body);

        self.checkPermission(req, self.sc.privs.MODIFY_ACCOUNT, function(err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(resp);
            } else {

                accountDao.updateAccount(account, userId, function(err, value){
                    if(!err &&value != null){
                        self.log.debug(accountId, userId, '<< updateAccount');
                        self.createUserActivity(req, 'MODIFY_ACCOUNT', null, null, function(){});

                        resp.send(value.toJSON("public"));
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

    testCopyTemplateAccount: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> copyTemplateAccount');

        var srcAccountId = parseInt(req.params.id);

        accountManager.copyAccountTemplate(accountId, userId, srcAccountId, accountId, function(err, newAccount){
            self.log.debug(accountId, userId, '<< copyTemplateAccount');
            self.sendResultOrError(resp, err, newAccount, "Error copying Account");
        });
    },

    copyTemplateAccount: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> copyTemplateAccount');

        var srcAccountId = parseInt(req.params.id);


        accountManager.copyAccountTemplate(accountId, userId, srcAccountId, accountId, function(err, newAccount){
            self.log.debug(accountId, userId, '<< copyTemplateAccount');
            self.sendResultOrError(resp, err, newAccount, "Error copying Account");
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
        var self = this;
        self.getOrgId(null, null, req, function(err, orgId) {
            var subdomain = '' || req.query.subdomain;
            accountManager.getAccountBySubdomainAndOrgId(subdomain.toLowerCase(), orgId, function (err, value) {
                if(!err){
                    if(value!=null){
                        resp.send(value.toJSON("public"));
                    } else {
                        resp.send({});
                    }
                } else{
                    resp.wrapError(resp,500,null,err,value);
                }
            });
        });

    },

    checkSubdomainAvailability: function(req, res) {
        var self = this;
        self.log.debug('>> checkSubdomainAvailability');
        var subdomain = req.params.subdomain.toLowerCase();

        self.getOrgId(null, null, req, function(err, orgId){
            accountManager.getAccountBySubdomainAndOrgId(subdomain, orgId, function(err, value){
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
        self.getOrgId(null, null, req, function(err, orgId){
            accountManager.getAccountsBySubdomainAndOrgId(accountId, subdomain, orgId, function(err, value){
                if(err) {
                    res.wrapError(res,500,null,err,value);
                } else if(value === null) {
                    res.send("false");
                } else {
                    res.send("true");
                }
            });
        });

    },

    checkSubdomainDuplicacyAdmin: function(req, res) {
        var self = this;
        self.log.debug('>> checkSubdomainDuplicacyAdmin');
        var subdomain = req.params.subdomain;
        var accountId = parseInt(self.accountId(req));

        self.log.debug('>> subdomain = ' + subdomain );
        self.log.debug('>> accountId = ' + accountId );
        self.getOrgId(null, null, req, function(err, orgId) {
            accountManager.getAccountBySubdomainAndOrgId(subdomain, orgId, function (err, value) {
                if(err) {
                    res.wrapError(res,500,null,err,value);
                } else if(value === null) {
                    res.send({isDuplicate: false, candidateDomain: subdomain});
                } else {
                    res.send({isDuplicate: true, candidateDomain: subdomain});
                }
            });
        });

    },

    _addTrialDaysToAccount: function(account) {
        var billing = account.get('billing') || {};
        var trialDays = billing.trialLength || appConfig.trialLength;//using 15 instead of 14 to give 14 FULL days
        var endDate = moment(billing.signupDate).add(trialDays, 'days');

        var trialDaysRemaining = endDate.diff(moment(), 'days');
        if(trialDaysRemaining < 0) {
            trialDaysRemaining = 0;
        }
        account.set('trialDaysRemaining', trialDaysRemaining);
    },

    listAccountTemplates: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.oaAccountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> listAccountTemplates');
        accountDao.listAccountTemplates(accountId, userId, function(err, templates){
            self.log.debug(accountId, userId, '<< listAccountTemplates');
            return self.sendResultOrError(resp, err, templates, "Error listing Account Templates");
        });
    },
    addUserToAccount: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var callingUser = parseInt(self.userId(req));
        self.log.debug(accountId, callingUser, '>> addUserToAccount');

        var userId = parseInt(req.params.userId);
        var roleAry = ['super','admin','member'];

        self.log.debug(callingUser);

        userManager.addUserToAccount(accountId, userId, roleAry, callingUser, function(err, user){
            self.log.debug('<< addUserToAccount');
            return self.sendResultOrError(resp, err, user, 'Error adding user to account', null);
        });
    },

    _getOrgAccessToken: function(accountId, userId, orgId, fn) {
        var self = this;
        orgManager.getOrgById(accountId, userId, orgId, function(err, organization){
            if(organization) {
                accountDao.getAccountByID(organization.get('adminAccount'), function(err, account){
                    if(account) {
                        var credentials = account.get('credentials');
                        var creds = null;
                        _.each(credentials, function (cred) {
                            if (cred.type === 'stripe') {
                                creds = cred;
                            }
                        });
                        if(creds && creds.accessToken) {
                            return fn(null, creds.accessToken);
                        } else {
                            return fn(null, null);
                        }
                    } else {
                        fn(err);
                    }
                });
            } else {
                fn(err);
            }
        });
    }
});

module.exports = new api();
