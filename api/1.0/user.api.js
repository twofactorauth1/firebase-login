/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var userDao = require('../../dao/user.dao');
var accountDao = require('../../dao/account.dao');
var orgDao = require('../../organizations/dao/organization.dao');
var passport = require('passport');
var cookies = require('../../utils/cookieutil');
var authenticationDao = require('../../dao/authentication.dao');
var userManager = require('../../dao/user.manager');
var paymentsManager = require('../../payments/payments_manager');
var productManager = require('../../products/product_manager');
var async = require('async');
var UAParser = require('ua-parser-js');
var contactActivityManager = require('../../contactactivities/contactactivity_manager');
var parser = new UAParser();
var contactDao = require('../../dao/contact.dao');
var appConfig = require('../../configs/app.config');
var orderManager = require('../../orders/order_manager');
var campaignManager = require('../../campaign/campaign_manager');
var moment = require('moment');
var CryptoJS = require('crypto-js');
var formidable = require('formidable');
var Intercom = require('intercom.io');
var intercomConfig = require('../../configs/intercom.config');
var intercom = new Intercom(intercomConfig.INTERCOM_APP_ID, intercomConfig.INTERCOM_API_KEY);



var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "user",

    dao: userDao,

    initialize: function() {
        app.get(this.url(''), this.isAuthApi.bind(this), this.getLoggedInUser.bind(this));
        app.get(this.url('accounts'), this.isAuthApi.bind(this), this.getUserAccounts.bind(this));
        app.post(this.url('accounts/:id'), this.isAuthApi.bind(this), this.setActiveAccount.bind(this));
        app.post(this.url('password'), this.isAuthApi.bind(this), this.setPassword.bind(this));

        app.get(this.url('social'), this.isAuthApi.bind(this), this.getLoggedInUserSocialCredentials.bind(this));
        app.delete(this.url('social/:type'), this.isAuthApi.bind(this), this.removeSocialCredentials.bind(this));

        app.get(this.url('security'), this.isAuthApi.bind(this), this.initializeSecurity.bind(this));

        app.get(this.url('preferences'), this.isAuthAndSubscribedApi.bind(this), this.getUserPreferences.bind(this));
        app.post(this.url('preferences'), this.isAuthAndSubscribedApi.bind(this), this.updateUserPreferences.bind(this));


        app.post(this.url(''), this.createUser.bind(this));
        app.post(this.url('member'), this.isAuthAndSubscribedApi.bind(this), this.createUserForAccount.bind(this));
        app.get(this.url('members'), this.isAuthAndSubscribedApi.bind(this), this.getUsersForAccount.bind(this));
        app.post(this.url('member/:id/resetpassword'), this.isAuthAndSubscribedApi.bind(this), this.resetPassword.bind(this));
        app.post(this.url('initialize'), this.initializeUserAndAccount.bind(this));

        app.get(this.url('authenticated'), this.setup.bind(this), this.isAuthenticatedSession.bind(this));
        app.get(this.url('orgConfig'), this.isAuthApi.bind(this), this.getOrgConfig.bind(this));
        app.post(this.url('orgConfig'), this.isAuthApi.bind(this), this.updateOrgConfig.bind(this));
        app.get(this.url(':id'), this.isAuthApi.bind(this), this.getUserById.bind(this));
        app.put(this.url(':id'), this.isAuthApi.bind(this), this.updateUser.bind(this));
        app.post(this.url(':id/permissions'), this.isAuthApi.bind(this), this.updateUserPermissions.bind(this));
        app.delete(this.url(':id'), this.isAuthAndSubscribedApi.bind(this), this.deleteUser.bind(this));

        app.get(this.url('exists/:username'), this.setup.bind(this), this.userExists.bind(this));
        app.get(this.url(':accountId/user/exists/:username', "account"), this.setup.bind(this), this.userExistsForAccount.bind(this));
        app.get(this.url('email/:email'), this.isAuthApi.bind(this), this.findByEmail.bind(this));

        app.post(this.url('profile/:id'), this.isAuthApi.bind(this), this.updateUserProfileImage.bind(this));
    },

    /**
     * No security needed.
     * @param req
     * @param resp
     */
    getUserAccounts: function(req, resp) {
        var self = this;
        self.log.debug('>> getUserAccounts');
        /*
         * This method assumes a user has been authenticated.  It will only return the accounts that were present at
         * authentication-time.
         */
        var result = {
            activeAccount: req.session.accountId,
            accounts: req.session.accounts
        };
        self.log.debug('<< getUserAccounts');
        self.sendResult(resp, result);
    },

    /** No security needed.
     *
     * @param req
     * @param resp
     */
    setActiveAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> setActiveAccount');
        var activeAccountId = parseInt(req.params.id);
        req.session.accountId = activeAccountId;
        self.log.debug('<< setActiveAccount (' + req.session.accountId + ')');
        self.send200(resp);
    },

    /**
     * No security needed.
     * @param req
     * @param resp
     */
    getLoggedInUser: function(req,resp) {
        var self = this;

        var user = req.user;

        userDao.getById(user.id(), function(err, value) {
           if (!err && value) {
               var json = value.toJSON("manage", {accountId:self.accountId(req)});
               if(json && json.profilePhotos && json.profilePhotos[0] && json.profilePhotos[0].url) {
                   json.profilePhotos[0] = json.profilePhotos[0].url;
               }
               return resp.send(json);
           } else {
               return self.wrapError(resp, 500, null, err, value);
           }
        });
    },

    getLoggedInUserSocialCredentials: function(req, resp) {
        var self = this;
        self.log.debug('>> getLoggedInUserSocialCredentials');
        var user = req.user;

        userDao.getById(user.id(), function(err, value) {
            if (!err) {
                var userObj = value.toJSON('public');
                self.log.debug('<< getLoggedInUserSocialCredentials');
                return resp.send(userObj.credentials);
            } else {
                self.log.error('Error getting user by id: ' + err);
                return self.wrapError(resp, 500, null, err, value);
            }
        });
    },

    removeSocialCredentials: function(req, resp) {
        var self = this;
        self.log.debug('>> removeSocialCredentials');

        var type = req.params.type;
        if(!type || type.length < 1) {
            return self.wrapError(resp, 400, 'Bad Request', 'Invalid type parameter.');
        }

        userDao.getById(req.user.id(), $$.m.User, function(err, user){
            if(err) {
                self.log.error('Error occurred loading user: ' + err);
                return self.wrapError(resp, 500, null, err);
            }
            var targetIndex = -1;
            var credentials = user.get('credentials');
            for(var i=0; i<credentials.length; i++) {
                if(credentials[i].type === type) {
                    targetIndex = i;
                }
            }
            if(targetIndex !== -1) {
                credentials.splice(targetIndex, 1);
            }
            user.set('credentials', credentials);
            //user.removeCredentials(type);
            userDao.saveOrUpdate(user, function(err, value){
                if(err) {
                    self.log.error('Error occurred removing social credentials: ' + err);
                    return self.wrapError(resp, 500, null, err);
                }
                resp.send(value.toJSON('public'));
                self.createUserActivity(req, 'REMOVE_SOCIAL_CREDENTIALS', null, {type: type}, function(){});
                return
            });
        });

    },

    /**
     * Utilized for testing.
     * @param req
     * @param res
     */
    initializeSecurity: function(req, res) {
        var self = this;
        var user = req.user;
        self.sm.initializeUserPrivileges(user.id(), user.get('username'), user.get('accounts')[0].permissions, self.accountId(req), function(err, result){
            res.send(result);
        });
    },


    getUserById: function(req,resp) {
        var self = this;
        var userId = req.params.id;
        self.log.debug('>> getUserById');

        if (!userId) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }

        //userId = parseInt(userId);

        userDao.getById(userId, function(err, value) {
            if (!err) {

                if (value == null) {
                    self.log.debug('<< getUserById(404)');
                    return self.wrapError(resp, 404, null, "No User found with ID: [" + userId + "]");
                }
                var accountId = parseInt(self.accountId(req));
                if(_.contains(value.getAllAccountIds(), accountId)) {
                    var responseObj =  value.toJSON("public", {accountId:self.accountId(req)});
                    self.log.debug('<< getUserById');
                    self.checkPermissionAndSendResponse(req, self.sc.privs.VIEW_USER, resp, responseObj);
                } else {
                    self.log.debug('<< getUserById(404p)');
                    return self.wrapError(resp, 404, null, "No User found with ID: [" + userId + "]");
                }
                //return resp.send(value.toJSON("public", {accountId:self.accountId(req)}));
            } else {
                self.log.debug('<< getUserById(401)');
                return self.wrapError(resp, 401, null, err, value);
            }
        });
    },
    /**
      find by email
      @params:eamil of user
    */
    findByEmail: function(req,resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        var userEmail = req.params.email;
        self.log.debug(accountId, userId, '>> findByEmail');

        if (!userEmail) {
            return this.wrapError(resp, 400, null, "Invalid parameter for ID");
        }
        userDao.getUserByUsername(userEmail, function(err, value) {
            if (!err) {
                var responseObj = null;// if value is not set it null
                if (value != null) {
                    responseObj =  value.toJSON("public", {accountId:accountId});
                }
                self.log.debug(accountId, userId, '<< getUserById');
                self.checkPermissionAndSendResponse(req, self.sc.privs.VIEW_USER, resp, responseObj);
            } else {
                self.log.debug('<< getUserById(400)');
                return self.wrapError(resp, 400, null, err, value);
            }
        });
    },

    /**
     * No security required.
     * @param req
     * @param resp
     * @returns {*}
     */
    userExists: function(req,resp) {
        var self = this;

        var username = req.params.username.toLowerCase();
        self.log.debug('>> userExists ', username);

        // var accountId = this.accountId(req);
        // if (accountId > 0) {
        //     req.params.accountId = accountId;
        //     return this.userExistsForAccount(req, resp);
        // }
        userDao.usernameExists(username, function(err, value) {
            self.log.debug('>> usernameExists ', value);
            if (err) {
                return self.wrapError(resp, 500, "An error occurred checking username", err, value);
            }
            return resp.send(value);
        });
    },


    userExistsForAccount: function(req,resp) {
        var self = this;
        var username = req.params.username.toLowerCase();
        var accountId = req.params.accountId;

        accountId = parseInt(accountId);

        self.checkPermissionForAccount(req, self.sc.privs.VIEW_USER, accountId, function (err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                userDao.usernameExistsForAccount(accountId, username, function(err, value) {
                    if (err) {
                        return self.wrapError(resp, 500, "An error occurred checking username for account", err, value);
                    }
                    return resp.send(value);
                });
            }
        });


    },

    createLead: function(user, account, sub, ipAddress, fn) {
        var self = this;
        self.log.debug('sub: ', sub);


        var hash = CryptoJS.HmacSHA256(user.get('email'), intercomConfig.INTERCOM_SECRET_KEY);
        self.log.debug('calculated hash:', hash.toString(CryptoJS.enc.Hex));
        self.log.debug('APP_ID:' + intercomConfig.INTERCOM_APP_ID);
        self.log.debug("API_KEY:" + intercomConfig.INTERCOM_API_KEY);
        intercom.createUser({
                name: user.get('first') + ' ' + user.get('last'),
                email: user.get('email'),
                //user_hash: hash.toString(CryptoJS.enc.Hex),
                created_at: Math.floor(Date.now() / 1000),
                last_seen_ip: ipAddress,
                custom_attributes: {
                    "accountURL": account.attributes.subdomain + '.indigenous.io',
                    "accountId" : account.attributes._id,
                    "userId" : user.attributes._id,
                    "signupDate": account.attributes.billing.signupDate
                }
            },
            function(err, intercomData){
                if (err) {
                    self.log.error('Error retrieving Intercom Data: ', err);
                    return fn();
                }
                user.set('intercomHash', hash.toString());
                userDao.saveOrUpdate(user, function(err, updatedUser){
                    if(err) {
                        self.log.warn('intercom hash not stored on user:', err);
                        //not throwing an error.  We should not stop the flow for this.
                    }
                });

                var newuser = {
                    "name": user.attributes.first+' '+user.attributes.last,
                    "url": account.attributes.subdomain+'.indigenous.io',
                    "contacts": [
                        {
                            "name": user.attributes.first+' '+user.attributes.last,
                            "title": "",
                            "emails": [
                                {
                                    "type": "office",
                                    "email": user.attributes.email
                                }
                            ]
                        }
                    ],
                    "custom": {
                        "Intercom Chat": intercomConfig.INTERCOM_USERS_LINK+intercomData.id,
                        "Account URL": account.attributes.subdomain+'.indigenous.io',
                        "Account ID": account.attributes._id,
                        "User ID": user.attributes._id,
                        "Signup Date": account.attributes.billing.signupDate
                    }
                };
                if(account.get('business').phones && account.get('business').phones[0]) {
                    var phone = account.get('business').phones[0].number;
                    newuser.contacts[0].phones = [];
                    newuser.contacts[0].phones.push({type:'mobile', phone:phone});
                }

                return fn(null, null);
            }
        );




    },

    initializeUserAndAccount: function(req, res) {
        var self = this, user, deferred;
        self.log.debug('>> initializeUserAndAccount');
        console.dir(req.body);

        var username = req.body.username.toLowerCase();
        var password1 = req.body.password;
        //var password2 = req.body.password2; -- verification is done on the frontend.
        var email = req.body.username.toLowerCase();
        var accountToken = req.body.accountToken;
        var anonymousId = req.body.anonymousId;
        var coupon = req.body.coupon;
        var fingerprint = req.body.fingerprint;
        var setupFee = req.body.setupFee;
        var firstName = req.body.first;
        var lastName = req.body.last;
        var middle = req.body.middle;
        var campaignId = req.body.campaignId;
        var existingUser = req.body.existingUser;
        var billingPostalCode = req.body.billingPostalCode;
        var billingState = req.body.billingState;
        var orgId = req.body.orgId || 0;
        if(orgId && parseInt(orgId) === 1) {
            setupFee = 150000;//$1500.00
        }

        var cardToken = req.body.cardToken;
        var plan = req.body.plan || 'NO_PLAN_ARGUMENT';
        var trialLength = req.body.trialLength || 31;//using 31 instead of 30 to give 30 FULL days
        self.log.debug('>> plan ', plan);

        var sendWelcomeEmail = true;//this can be overridden in the request.
        if(req.body.sendWelcomeEmail && req.body.sendWelcomeEmail === false) {
            sendWelcomeEmail = false;
        }

        //createStripeCustomer
        //updateCurrentAccountBilling

        //ensure we don't have another user with this username;
        var cookieAccountToken = cookies.getAccountToken(req);
        if(cookieAccountToken !== accountToken) {
            self.log.warn('cookieAccountToken [' + cookieAccountToken + '] does not equal accountToken [' + accountToken + ']');
        }
        self.log.debug('>> username', username);
        self.log.debug('>> password1', password1);
        self.log.debug('>> email', email);
        self.log.debug('>> accountToken', accountToken);
        self.log.debug('>> cardToken', cardToken);
        self.log.debug('>> plan', plan);
        self.log.debug('>> anonymousId', anonymousId);
        self.log.debug('>> coupon', coupon);
        self.log.debug('>> setupFee', setupFee);
        self.log.debug('>> first', firstName);
        self.log.debug('>> middle', middle);
        self.log.debug('>> last', lastName);
        self.log.debug('>> campaignId', campaignId);
        self.log.debug('>> existingUser', existingUser);
        self.log.debug('>> orgId', orgId);

        var name = {
            first:firstName,
            middle:middle,
            last:lastName
        };
        var ipAddress = self.ip(req);
        var organization, product, originalOrganization;

        async.waterfall([
            function(callback) {
                //figure out the setup fee
                orgDao.getById(orgId, $$.m.Organization, function(err, _organization){
                    if(err) {
                        self.log.error('Could not get organization:', err);
                        callback(err);
                    } else {
                        originalOrganization = _organization;
                        var adminAccountId = _organization.get('adminAccount');
                        productManager.getProductByStripePlan(adminAccountId, null, plan, function(err, _product){
                            if(err) {
                                self.log.error('Could not get product:', err);
                                callback(err);
                            } else {
                                organization = _organization;
                                product = _product;
                                setupFee = 0;
                                if(product) {
                                    var stripePlan = product.get('product_attributes').stripePlans[0];
                                    if(stripePlan) {
                                        try {
                                            setupFee = parseInt(stripePlan.signup_fee);
                                            if(isNaN(setupFee)) {
                                                setupFee = 0;
                                            }
                                            self.log.debug('Using setupFee:', setupFee);
                                        } catch(exception) {
                                            setupFee = 0;
                                            self.log.debug('caught exception.  setupFee:', setupFee);
                                        }
                                    }
                                }

                                callback();
                            }
                        });
                    }
                });
            },
            function(callback){
                if(!password1 && !existingUser) {
                    self.log.debug('Creating user from social');
                    userManager.createAccountAndUserFromTempAccount(accountToken, fingerprint, sendWelcomeEmail, function(err, accountAndUser){
                        if(err) {
                            self.log.error('Error creating account or user: ' + err);
                            return self.wrapError(res, 500, 'Error', 'Error creating account or user.');
                        }
                        callback(null, accountAndUser.user, accountAndUser.account);
                    });
                } else {
                    userManager.createAccountAndUser(username, password1, email, accountToken, anonymousId, fingerprint, sendWelcomeEmail, name, orgId, function (err, accountAndUser) {
                        if (err) {
                            self.log.error('Error creating account or user: ' + err);
                            return self.wrapError(res, 500, 'Error', 'Error creating account or user.');
                        }
                        callback(null, accountAndUser.user, accountAndUser.account);
                    });
                }
            },
            function(user, account, callback){
                //store the plan, coupon, setupFee on the account billing object in case of any billing anomalies
                var billingObj = account.get('billing');
                billingObj.plan = plan;
                billingObj.coupon = coupon;
                billingObj.setupFee = setupFee;
                billingObj.signupDate = new Date();
                billingObj.trialLength = trialLength;
                if(billingPostalCode){
                    billingObj.details = {
                        zip: billingPostalCode,
                        state: billingState
                    }
                }
                account.set('ownerUser', user.id());
                accountDao.saveOrUpdate(account, function (err, updatedAccount) {
                    if(err || updatedAccount === null) {
                        self.log.error('Error creating Stripe customer: ' + err);
                        return self.wrapError(res, 500, 'Error storing plan, coupon, and setupFee', err);
                    } else {
                        self.log.debug('Added plan, coupon, and setupFee to account billing obj');
                        callback(null, user, updatedAccount);
                    }
                });
            },
            function(user, account, callback) {
                if(organization && organization.id() !== 0) {
                    accountDao.getAccountByID(organization.get('adminAccount'), function(err, adminAccount){
                        if(adminAccount) {
                            self.getStripeTokenFromAccountObject(adminAccount, req, function(err, accessToken){
                                if(err || !accessToken) {
                                    self.log.error('Error getting access token:', err);
                                    callback(err || 'Error getting access token');
                                } else {
                                    callback(null, user, account, organization, adminAccount, accessToken);
                                }
                            });
                        } else {
                            self.log.error('Error getting admin account:', err);
                            callback(err || 'Error getting admin account');
                        }
                    });
                } else {
                    callback(null, user, account, organization, null, null);
                }
            },
            function(user, account, organization, adminAccount, accessToken, callback){
                self.log.debug('Created user[' + user.id() + '] and account[' + account.id() + '] objects.');
                var ownerAccountId = appConfig.mainAccountID;

                if(orgId && orgId !== 0) {
                    ownerAccountId = organization.get('adminAccount');
                }
                paymentsManager.createStripeCustomerForUser(cardToken, user, ownerAccountId, account.id(), accessToken, orgId, function(err, stripeCustomer) {
                    if (err) {
                        self.log.error('Error creating Stripe customer: ' + err);
                        accountDao.deleteAccountAndArtifacts(account.id(), function(_err, value){
                            return self.wrapError(res, 500, 'Error creating Stripe Customer', err.code);
                        });
                    } else {
                        callback(null, stripeCustomer, user, account, accessToken);
                    }

                });

            },
            function(stripeCustomer, user, account, accessToken, callback){
                self.log.debug('Created Stripe customer: ' +  stripeCustomer.id);
                if(plan != 'NO_PLAN_ARGUMENT') {
                    paymentsManager.createStripeSubscription(stripeCustomer.id, plan, account.id(), user.id(), coupon, setupFee, accessToken, function(err, sub) {
                        if (err) {
                            self.log.error('Error creating Stripe subscription: ' + err);
                            accountDao.deleteAccountAndArtifacts(account.id(), function(_err, value){
                                return self.wrapError(res, 500, 'Error creating Stripe Subscription', err.code);
                            });
                        } else {
                            callback(null, sub, stripeCustomer, user, account, accessToken);
                        }
                    });
                } else {
                    callback(null, null, stripeCustomer, user, account, accessToken);
                }


            },
            function(sub, stripeCustomer, user, account, accessToken, callback) {
                if(sub) {
                    self.log.debug('Created subscription: ' + sub.id);
                } else {
                    self.log.debug('No subscription created.');
                    sub = {id:'NOSUBSCRIPTION', plan:{amount:0,name:'NOSUBSCRIPTION'}};
                }

                accountDao.getAccountByID(account.id(), function(err, account) {
                    if (err || account === null) {
                        self.log.error('Error retrieving new account: ' + err);
                        return self.wrapError(res, 500, 'Error getting new account', err);
                    }
                    var billingObj = account.get('billing');
                    billingObj.stripeCustomerId = stripeCustomer.id;
                    billingObj.subscriptionId = sub.id;
                    account.set('billing', billingObj);
                    accountDao.saveOrUpdate(account, function (err, updatedAccount) {
                        if (err) {
                            self.log.error('Error saving billing information to account: ' + err);
                            return self.wrapError(res, 500, 'Error saving billing information to account', err);
                        }

                        if(req.user || req.session.cookie) {
                            //we are currently logged in with another account.  We need to logout before logging into the new account.
                            //req.session.cookie = null;
                            req.session.accountId = null;
                            req.logout();
                            req.user = null;
                        }
                        req.session.accountId = updatedAccount.id();
                        req.session.unAuthAccountId = updatedAccount.id();
                        req.session.subdomain = updatedAccount.get('subdomain');
                        req.session.domain = updatedAccount.get('domain');
                        //req.session.locked = true;//TODO: change this eventually
                        self.log.debug('Just set session accountId to: ' + req.session.accountId);

                        callback(null, account.id(), sub.id, user, stripeCustomer.id, sub, updatedAccount, accessToken);
                    });
                });
            },
            function(accountId, subId, user, stripeCustomerId, sub, account, accessToken, callback) {
                if(orgId && orgId>0) {
                    orgDao.getById(orgId, $$.m.Organization, function(err, organization){
                        callback(err, accountId, subId, user, stripeCustomerId, sub, account, organization, accessToken);
                    });
                } else {
                    callback(null, accountId, subId, user, stripeCustomerId, sub, account, null, accessToken);
                }
            },
            function(accountId, subId, user, stripeCustomerId, sub, account, organization, accessToken, callback) {
                self.log.debug('Updated account billing.');
                self.sm.addSubscriptionToAccount(accountId, subId, plan, user.id(), function(err, value){
                    if(organization) {
                        authenticationDao.getAuthenticatedUrlForAccountAndOrgObject(accountId, user.id(), 'admin/welcome', null, organization, function(err, value){
                            if(err) {
                                res.redirect("/home");
                                self = null;
                                return;
                            } else {
                                callback(err, accountId, subId, user, stripeCustomerId, sub, account, organization, value, accessToken);
                            }

                        });
                    } else {
                        authenticationDao.getAuthenticatedUrlForAccount(accountId, user.id(), 'admin/welcome', null, function(err, value){
                            callback(err, accountId, subId, user, stripeCustomerId, sub, account, organization, value, accessToken);
                        });
                    }
                });
            },
            function(accountId, subId, user, stripeCustomerId, sub, account, organization, value, accessToken, callback){
                self.log.debug('Redirecting to: ' + value);

                user.set("accountUrl", value.toLowerCase());
                var json = user.toJSON('public', {accountId:accountId});

                req.session.midSignup = false;
                self.createUserActivityWithParams(accountId, user.id(), 'CREATE_ACCOUNT', null, "Congratulations, your account was successfully created.", function(){});
                var activity = new $$.m.ContactActivity({
                    accountId: accountId,
                    activityType: "ACCOUNT_CREATED",
                    detail : "Congratulations, your account was successfully created.",
                    start: new Date()
                });
                contactActivityManager.createActivity(activity, function(err, value){});

                self.log.debug('Creating customer contact for main account.');
                var adminAccountId = appConfig.mainAccountID;
                if(organization && organization.id() !== 0) {
                    adminAccountId = organization.get('adminAccount');
                }
                contactDao.createCustomerContact(user, adminAccountId, fingerprint, self.ip(req), function(err, contact){
                    if(err) {
                        self.log.error('Error creating customer for user: ' + user.id());
                    } else {
                        self.log.debug('Created customer for user:' + user.id());

                        self.createLead(user, account, sub, ipAddress, function(err, leadId) {
                            var orgSettings = originalOrganization.get('signupSettings');
                            if(orgSettings && orgSettings.welcomeEmail) {
                                userManager.sendOrgWelcomeEmail(accountId, account, originalOrganization, user, email, username, contact.id(), function(){
                                    self.log.debug('Sent welcome email');
                                });

                            }else {
                                userManager.sendWelcomeEmail(accountId, account, user, email, username, contact.id(), function(){
                                    self.log.debug('Sent welcome email');
                                });
                            }
                            if(leadId) {
                                //set the close.io leadId in the account billing section.
                                var billing = account.get('billing');
                                billing.closeLeadID = leadId;
                                accountDao.saveOrUpdate(account, function(){});
                            }
                            /*
                             * If there is a campaign associated with this new user, update it async.
                             */
                            if(campaignId) {
                                self.log.debug('Updating campaign with id: ' + campaignId);
                                campaignManager.handleCampaignSignupEvent(adminAccountId, campaignId, contact.id(), function(err, value){
                                    if(err) {
                                        self.log.error('Error handling campaign signup: ' + err);
                                    } else {
                                        self.log.debug('Handled signup.');
                                    }
                                });
                            }

                            var activity = new $$.m.ContactActivity({
                                accountId: appConfig.mainAccountID,
                                contactId: contact.id(),
                                activityType: $$.m.ContactActivity.types.SUBSCRIBE,
                                detail : "Subscribed to Indigenous",
                                start: new Date(),
                                extraFields: {
                                    plan: plan,
                                    setupFee: setupFee,
                                    coupon: coupon,
                                    amount: (sub.plan.amount / 100),
                                    plan_name: sub.plan.name
                                }
                            });
                            contactActivityManager.createActivity(activity, function(err, value){});
                            self.log.debug('creating Order for main account');
                            if(sub.id !=='NOSUBSCRIPTION') {
                                paymentsManager.getInvoiceForSubscription(stripeCustomerId, subId, accessToken, function(err, invoice){
                                    if(err) {
                                        self.log.error('Error getting invoice for subscription: ' + err);
                                    } else {
                                        orderManager.createOrderFromStripeInvoice(invoice, adminAccountId, contact.id(), accountId, function(err, order){
                                            if(err) {
                                                self.log.error('Error creating order for invoice: ' + err);
                                            } else {
                                                self.log.debug('Order created.');
                                            }
                                        });
                                    }
                                });
                            }

                            self.log.debug('Adding the admin user to the new account');
                            userManager.addUserToAccount(accountId, 1, ["super","admin","member"], 1, function(err, value){
                                if(err) {
                                    self.log.error('Error adding admin user to account:', err);
                                } else {
                                    self.log.debug('Admin user added to account ' + accountId);
                                }

                                if(organization && organization.get('adminUser') && organization.get('adminUser') > 1) {
                                    self.log.debug('Adding the org admin user to the new account');
                                    var orgAdminUser = organization.get('adminUser');
                                    userManager.addUserToAccount(accountId, orgAdminUser, ['super', 'admin', 'member'], orgAdminUser, function(err, value){
                                        if(err) {
                                            self.log.error('Error adding org admin user to account:', err);
                                        } else {
                                            self.log.debug('Org Admin user added to account ' + accountId);
                                        }
                                        callback(null, accountId);
                                    });
                                } else {
                                    callback(null, accountId);
                                }

                            });

                        });

                    }
                });
                self.log.debug('<< initalizeUserAndAccount: ', json);
                res.send(json);
            }
        ], function(err, accountId){
            //we don't really need to do anything here.
            self.log.debug('Finished creating account [' + accountId + ']');
            return;
        });
    },


    createUser: function(req,resp) {
        var self = this, user, deferred;
        self.log.debug('>> createUser');

        var username = req.body.username;
        var password1 = req.body.password;
        var password2 = req.body.password2;
        var email = req.body.username;
        var accountToken = req.body.accountToken;
        var anonymousId = req.body.anonymousId;
        var fingerprint = req.body.fingerprint;
        var firstName = req.body.first;
        var lastName = req.body.last;
        var middle = req.body.middle;


        var sendWelcomeEmail = true;//this can be overridden in the request.
        if(req.body.sendWelcomeEmail && req.body.sendWelcomeEmail === false) {
            sendWelcomeEmail = false;
        }

        // if (username == null || username.trim() == "") {
        //     req.flash("error", "You must enter a valid username");
        //     return resp.redirect("/signup/create");
        // }

        // if (password1 !== password2) {
        //     req.flash("error", "Passwords do not match");
        //     return resp.redirect("/signup/create");
        // }

        // if (password1 == null || password1.trim() == "" || password1.length < 5) {
        //     req.flash("error", "You must enter a valid password at least 5 characters long");
        //     return resp.redirect("/signup/create");
        // }

        // var isEmail = $$.u.validate(email, { required: true, email: true }).success;
        // if (isEmail === false) {
        //     req.flash("error", "You must enter a valid email");
        //     return resp.redirect("/signup/create");
        // }

        //ensure we don't have another user with this username;
        accountToken = cookies.getAccountToken(req);

        self.log.debug('>> username', username);
        self.log.debug('>> password1', password1);
        self.log.debug('>> email', email);
        self.log.debug('>> accountToken', accountToken);
        self.log.debug('>> anonymousId', anonymousId);
        self.log.debug('>> first', firstName);
        self.log.debug('>> middle', middle);
        self.log.debug('>> last', lastName);

        var name = {
            first:firstName,
            middle:middle,
            last:lastName
        };

        userManager.createAccountAndUser(username, password1, email, accountToken, anonymousId, fingerprint, sendWelcomeEmail, name, 0, function (err, accountAndUser) {
            var userObj = accountAndUser.user;
            self.log.debug('createUserFromUsernamePassword >>>');
                if (!err) {
                    var value = accountAndUser.user;
                    req.login(value, function (err) {
                        if (err) {
                            return resp.redirect("/");
                        } else {

                            var accountId = accountAndUser.account.id();
                            self.log.debug('createUserFromUsernamePassword accountId >>>', accountId);
                            authenticationDao.getAuthenticatedUrlForAccount(accountId, self.userId(req), "admin", function (err, value) {
                                console.log('value url >>> ', value);
                                if (err) {
                                    resp.redirect("/home");
                                    self = null;
                                    return;
                                }
                                userObj.set("accountUrl",value.toLowerCase());
                                resp.send(userObj);
                                self = null;
                            });
                        }
                    });
                } else {
                    self.log.debug('createUserFromUsernamePassword >>> ERROR');

                    return resp.redirect("/page/signup");//TODO: Fix this
                }
        });

        // userDao.createUserFromUsernamePassword(username, password1, email, accountToken, function(err, value) {
        //     if (err) {
        //         return self.wrapError(resp, 500, "An error occurred checking username", err, value);
        //     }
        //     return resp.send(value);
        // });
    },

    /**
     * This method will create a 'member' for an account.  It expects two body params:
     * req.body.user contains a *limited* public/js/models/user.js object.  The only fields examined are username, email, first, last
     * req.body.password contains the password to encrypt and set.
     * @param req
     * @param resp
     */
    createUserForAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> createUserForAccount');
        var user = req.body.user;
        var password = req.body.password;
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_USER, function (err, isAllowed) {
            if (isAllowed !== true || !_.contains(value.getAllAccountIds(), self.accountId(req))) {
                return self.send403(resp);
            } else {
                var roleAry = ['member'];
                userManager.createAccountUser(accountId, user.username, password, user.email, user.first, user.last, req.user, roleAry, function(err, user){
                    self.log.debug('<< createUserForAccount');
                    var responseObj = null;
                    if(user) {
                        responseObj =  user.toJSON("public", {accountId:self.accountId(req)});
                    }

                    self.sendResultOrError(resp, err, responseObj, 'Error creating user');
                    self.createUserActivity(req, 'CREATE_USER', null, {username: user.username}, function(){});
                    return;
                });
            }
        });


    },

    /**
     *
     * @param req
     * @param resp
     */
    getUsersForAccount: function(req, resp) {
        var self = this;
        self.log.debug('>> getUsersForAccount');

        var accountId = parseInt(self.accountId(req));
        self.checkPermission(req, self.sc.privs.VIEW_USER, function (err, isAllowed) {
            if (isAllowed !== true || !_.contains(req.user.getAllAccountIds(), accountId) || !_.contains(req.user.getPermissionsForAccount(accountId), 'admin')) {
                return self.send403(resp);
            } else {
                userManager.getUserAccounts(accountId, true, function(err, userAry){
                    if(err) {
                        self.log.error('Error finding user accounts: ' + err);
                        return self.wrapError(resp, 500, null, 'Error finding account');
                    } else {
                        var results = [];
                        _.each(userAry, function(element){
                            results.push(element.toJSON('manage', {accountId:accountId}));
                        });
                        return self.sendResult(resp, results);
                    }

                });

            }
        });

    },

    resetPassword: function(req, resp) {
        var self = this;
        self.log.debug('>> resetPassword');
        var ua = req.headers['user-agent'];
        var result = parser.setUA(ua).getResult();
        var ip = self.ip(self.req);
        var date = moment().format('MMMM DD, YYYY hh:mm A');
        var browser = result.browser.name;
        var os = result.os.name;
        var accountId = parseInt(self.accountId(req));

        var requestorProps = {
            ip: ip,
            date: date,
            browser: browser,
            os: os
        };
        self.checkPermission(req, self.sc.privs.VIEW_USER, function (err, isAllowed) {
            if (isAllowed !== true || !_.contains(req.user.getAllAccountIds(), accountId) || !_.contains(req.user.getPermissionsForAccount(accountId), 'admin')) {
                return self.send403(res);
            } else {
                var userId = parseInt(req.params.id);
                userDao.getById(userId, $$.m.User, function(err, value){
                    if(err || value === null) {
                        self.log.error('Error getting user by id: ' + err);
                        return self.wrapError(resp, 500, null, 'Error getting user by id');
                    }
                    authenticationDao.sendForgotPasswordEmailByUsernameOrEmail(accountId, value.get('username'), requestorProps, function(err, value) {
                        if(err) {
                            self.log.error('Error sending email: ' + err);
                            return self.wrapError(resp, 500, null, 'Error sending forgot password email.');
                        } else {
                            self.log.debug('<< resetPassword');
                            self.sendResult(resp, 'sent');
                            self.createUserActivity(req, 'RESET_PASSWORD', null, {id: userId}, function(){});
                            return;
                        }
                    });
                });
            }
        });

    },


    /**
     * This method WILL NOT update credentials for the user nor the account/credentials object.
     * @param req
     * @param resp
     */
    updateUser: function(req,resp) {
        //TODO - ensure user accounts are not tampered with
        var self = this;
        var user = new $$.m.User(req.body);
        var userId=req.body._id;



        userDao.getById(userId, function(err, value) {
            if (!err && value != null) {
                value.set("welcome_alert",req.body.welcome_alert);
                //console.log(value);
                user.set("credentials",value.get("credentials"));
                user.set('accounts', value.get('accounts'));
                if(user.get('welcome_alert')) {
                    self.log.warn('user object contains welcome_alert:', user);
                    var userPreferences = user.get('user_preferences');
                    userPreferences.welcome_alert = user.get('welcome_alert');
                    delete user.attributes.welcome_alert;
                }
                self.checkPermission(req, self.sc.privs.MODIFY_USER, function (err, isAllowed) {
                    if (isAllowed !== true || !_.contains(value.getAllAccountIds(), self.accountId(req))) {
                        return self.send403(resp);
                    } else {
                        userDao.saveOrUpdate(user, function(err, value) {
                            if (!err && value != null) {
                                resp.send(value.toJSON("public"));
                                self.createUserActivity(req, 'UPDATE_USER', null, {id: userId}, function(){});
                            } else {
                                self.wrapError(resp, 500, null, err, value);
                            }
                        });
                    }
                });


            } else {
                return self.wrapError(resp, 401, null, err, value);
            }
        });


    },

    getOrgConfig: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> getOrgConfig');
        userManager.getUserOrgConfig(accountId, userId, function(err, orgConfig){
            self.log.debug(accountId, userId, '<< getOrgConfig');
            self.sendResultOrError(resp, err, orgConfig, 'Error getting config');
        });
    },

    updateOrgConfig: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateOrgConfig');
        var orgConfig = req.body;
        userManager.updateUserOrgConfig(accountId, userId, orgConfig, function(err, orgConfig){
            self.log.debug(accountId, userId, '<< updateOrgConfig');
            self.sendResultOrError(resp, err, orgConfig, 'Error updating config');
        });
    },

    updateUserPermissions: function(req, resp) {
        var self = this;
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        self.log.debug(accountId, userId, '>> updateUserPermissions');
        var roleAry = req.body.roleAry;
        var targetUserId = parseInt(req.params.id);
        if(targetUserId === 1) {
            //can't update admin!
            return self.send403(resp);
        }
        self.isAdmin(req, function(err, isAdmin){
            self.isOrgAdminUser(accountId, userId, req, function(err, isOrgAdminUser){
                if(isAdmin === true || isOrgAdminUser === true) {
                    userManager.getUserById(targetUserId, function(err, user){
                        if(err || !user) {
                            self.log.error(accountId, userId, 'Error fetching user:', err);
                            return self.wrapError(resp, 500, null, err);
                        } else {
                            user.setPermissionsForAccount(accountId, roleAry);
                            userDao.saveOrUpdate(user, function(err, savedUser){
                                self.log.debug(accountId, userId, '<< updateUserPermissions');
                                self.sendResultOrError(resp, err, savedUser.toJSON('manage', {accountId:accountId}), 'Error updating user');
                            });
                        }
                    });
                } else {
                    return self.send403(resp);
                }
            });
        });
    },

    getUserPreferences: function(req, res) {
        var self = this;
        self.log.debug('>> getUserPreferences');

        var user = req.user;
        self.checkPermission(req, self.sc.privs.VIEW_USER, function (err, isAllowed) {

            if (isAllowed !== true ) {
                return self.send403(res);
            } else {
                userDao.getById(user.id(), function(err, value) {
                    if (!err) {
                        self.log.debug('<< getUserPreferences');
                        return res.send(value.get('user_preferences'));
                    } else {
                        self.log.error('Error getting user: ' + err);
                        return self.wrapError(res, 500, null, err, value);
                    }
                });
            }
        });


    },

    updateUserPreferences: function(req, res) {
        var self = this;
        self.log.debug('>> updateUserPreferences');
        self.checkPermission(req, self.sc.privs.MODIFY_USER, function (err, isAllowed) {
            if (isAllowed !== true ) {
                return self.send403(res);
            } else {
                var user = req.user;
                var preferences = req.body;
                userDao.getById(user.id(), function(err, savedUser) {
                    if(err) {
                        self.log.error('Error getting user: ' + err);
                        return self.wrapError(res, 500, null, err, value);
                    } else {
                        savedUser.set('user_preferences', preferences);
                        userDao.saveOrUpdate(savedUser, function(err, updatedUser){
                            if(err) {
                                self.log.error('Error updating user preferences: ' + err);
                                return self.wrapError(res, 500, null, err, value);
                            } else {
                                self.log.debug('<< updateUserPreferences');
                                res.send(updatedUser.get('user_preferences'));
                                self.createUserActivity(req, 'MODIFY_PREFERENCES', null, null, function(){});
                                return;
                            }
                        });
                    }
                });
            }
        });


    },


    deleteUser: function(req,resp) {
        var self = this;
        self.log.debug('>> deleteUser');
        var userId = parseInt(req.params.id);
        var accountId = parseInt(self.accountId(req));

        self.checkPermission(req, self.sc.privs.MODIFY_USER, function (err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                userManager.deleteOrRemoveUserForAccount(accountId, userId, function(err, value){
                    self.log.debug('<< deleteUser');
                    self.sendResultOrError(resp, err, value, 'Error deleting user');
                    self.createUserActivity(req, 'DELETE_USER', null, {id: userId}, function(){});
                    return;
                });
            }
        });
    },


    updateUserProfileImage: function(req, res) {
        var self = this;
        self.log.debug('>> updateUserProfileImage');
        var form = new formidable.IncomingForm();
        var accountId = parseInt(self.accountId(req));
        var userId = self.userId(req);
        var memberId = parseInt(req.params.id);
        form.parse(req, function(err, fields, files) {
            if(err) {
                self.wrapError(res, 500, 'fail', 'The upload failed', err);
                self = null;
                return;
            } else {

                var file = files['file'];
                console.log(file);

                var fileToUpload = {};
                fileToUpload.mimeType = file.type;
                fileToUpload.size = file.size;
                fileToUpload.name = file.name;
                fileToUpload.path = file.path;
                fileToUpload.type = file.type;
                userManager.updateUserProfileImage(fileToUpload, memberId, accountId, userId, function(err, value, file){                                                       
                    self.sendResultOrError(res, err, value, 'Could not update profile image');                    
                });
            }


        });

    },

    isAuthenticatedSession: function(req, resp) {
        var self = this;
        self.log.debug('>> isAuthenticatedSession');
        var authenticatedAccountId = parseInt(self.accountId(req));
        var currentSessionAccountId = parseInt(self.currentAccountId(req));
        var respObj = {currentSession:false};
        if(authenticatedAccountId===currentSessionAccountId) {
            respObj.currentSession = true;
        }
        self.log.debug('<< isAuthenticatedSession');
        return resp.send(respObj);
    },

    setPassword: function(req, resp) {
        var self = this;
        self.log.debug('>> setPassword');
        self.checkPermission(req, self.sc.privs.MODIFY_USER, function (err, isAllowed) {
            if (isAllowed !== true) {
                return self.send403(res);
            } else {
                var userId = self.userId(req);
                var newPassword = req.body.password;
                userManager.setUserPassword(userId, newPassword, userId, function(err, value){
                    self.log.debug('<< setPassword');
                    self.sendResultOrError(resp, err, value, 'Error setting user password');
                    self.createUserActivity(req, 'SET_PASSWORD', null, {id: userId}, function(){});
                    return;
                });
            }
        });
    },
    isAdmin: function(req, fn) {
        var self = this;
        //console.log(req);
        
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

