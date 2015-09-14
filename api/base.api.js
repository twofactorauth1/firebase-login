/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

//var securityManager = require('../security/securitymanager');

var securityManager = require('../security/sm')(false);
var securityConstants = require('../security/utils/security.constants');
var appConfig = require('../configs/app.config');
var urlUtils = require('../utils/urlutils');
//var geoip = require('geoip-lite');
var logger = global.getLogger("base.api");
var userActivityManager = require('../useractivities/useractivity_manager');
var accountDao = require("../dao/account.dao");

//this flag instructs the securitymanager to verify the subscription.
var verifySubscription = true;

var apiBase = function(options) {

    this.init.apply(this, arguments);

};

_.extend(apiBase.prototype, {

    log: null,
    base: null,

    sm: securityManager,
    sc: securityConstants,

    init: function(options) {
        options = options || {};

        if (options.version) {
            this.version = options.version;
        } else {
            this.version = "1.0";
        }

        if (options.base) {
            this.base = options.base;
        }

        app.get(this.url('ping'), this.ping.bind(this));

        this.log = global.getLogger(this.base + ".api");

        if (this.initialize != null && this.initialize != 'undefined') {
            this.initialize();
        }
    },


    url: function(route, version, overrideBase) {
        if (version != null) {
            var match = version.match(/[a-zA-Z]*/);
            if (match != null && match.length > 0) {
                overrideBase = version;
                version = null;
            }
        }

        if (version == null) {
            version = this.version;
        }

        var base = this.base;
        if (overrideBase != null && overrideBase != "") {
            base = overrideBase;
        }
        var url= "/api/" + version + "/" + base;
        if (route != null && route != "") {
            url = url + "/" + route;
        }
        return url;
    },


    setup: function(req,resp, next) {
        var self = this;
        accountDao.getAccountByHost(req.get("host"), function(err, value) {
            if (!err && value != null) {
                if (value === true) {
                    logger.warn('Deprecated code reached.');
                    req.session.accountId = 0;
                } else {
                    req.session.unAuthAccountId = value.id();
                    req.session.unAuthSubdomain = value.get('subdomain');
                    req.session.unAuthDomain = value.get('domain');
                    //logger.debug('setting accountId: ' + req.session.accountId);
                }
            }

            return next();
        });
    },

    matchHostToSession: function(req) {
        var subObj = urlUtils.getSubdomainFromHost(req.host);
        var sSub = req.session.subdomain;
        var sDom = req.session.domain;
        if(sSub=== null && sDom===null) {//nothing to match
            logger.debug('matchHostToSession - nothing to match.  false');
            return false;
        }

        if(subObj.isMainApp === true) {
            var mainAppTest =  (sSub === 'www' || sSub === 'main' || sSub==='app');
            logger.debug('matchHostToSession - mainAppTest: ' + mainAppTest);
            return mainAppTest;
        }
        var matchHostToSessionTest = (sSub === subObj.subdomain || sDom === subObj.domain);
        logger.debug('matchHostToSession test: ' + matchHostToSessionTest);
        return matchHostToSessionTest;
    },


    isAuthApi: function(req, resp, next) {
        if (req.isAuthenticated() && this.matchHostToSession(req)) {
            return next()
        }

        var response = {
            code:401,
            status:"Not Authenticated",
            message:"User is not Authenticated",
            detail: ""
        };

        resp.send(response.code, response);
    },

    /**
     * This method verifies that the user is authenticated and the account has a valid subscription.
     * @param req
     * @param resp
     * @param next
     */
    isAuthAndSubscribedApi: function(req, resp, next) {
        var self = this;

        self.sm = securityManager;
        if(req.isAuthenticated() && this.matchHostToSession(req)) {
            //don't need to verify inidigenous main account
            if(appConfig.mainAccountID === self.accountId(req) || verifySubscription===false) {
                return next();
            } else {
                self.sm.verifySubscription(req, function(err, isValid){
                    if(isValid === true && (_.contains(req.session.subprivs, self.base) || _.contains(req.session.subprivs, 'all'))) {
                        return next();
                    } else {
                        logger.debug('subprivs does not contain ' + self.base);
                        var response = {
                            code: 403,
                            status: 'Not Authorized',
                            message: 'Your subscription could not be verified',
                            detail: ''
                        };
                        resp.send(response.code, response);
                    }
                });
            }

        } else {
            var response = {
                code:401,
                status:"Not Authenticated",
                message:"User is not Authenticated",
                detail: ""
            };

            resp.send(response.code, response);
        }
    },


    userId: function(req) {
        try {
            return req.user.attributes._id;
        }catch(exception) {
            return null;
        }
    },

    customerId: function(req) {
        try {
            return req.user.attributes.stripeId;
        }catch(exception) {
            return null;
        }
    },

    /**
     * This method is used to get the accountId of an authenticated session
     * @param req
     * @returns {*}
     */
    accountId: function(req) {
        try {
            return (req.session.accountId == null || req.session.accountId == 0) ? 0 : req.session.accountId;
        }catch(exception) {
            return null;
        }
    },

    /**
     * This method is used to get the accountId of an unauthenticated session
     * @param req
     * @returns {*}
     */
    currentAccountId: function(req) {
        try {
            var accountId = req.session.unAuthAccountId !== null ? req.session.unAuthAccountId: req.session.accountId;
            console.log('currentAccountId: ' + accountId);
            return accountId;
        } catch(exception) {
            return null;
        }
    },

    subdomain: function(req) {
        try {
            return req.session.subdomain;
        } catch(exception) {
            return null;
        }
    },

    domain: function(req) {
        try {
            return req.session.domain;
        } catch(exception) {
            return null;
        }
    },

    ip: function(req) {
        try {
            var ip = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;

            if(Array.isArray(ip)) {
                return ip[0];
            } else if(ip.indexOf(',') !== -1){
                return ip.split(',')[0].trim();
            } else{
                return ip;
            }
        } catch(exception) {
            return null;
        }

    },

    geo: function(req) {
        //return geoip.lookup(this.ip(req));
        return null;
    },


    sendResultOrError: function(resp, err, value, errorMsg, errorCode) {
        if (err) {
            this.wrapError(resp, errorCode || 500, errorMsg, err, value);
        } else {
            this.sendResult(resp, value);
        }
    },


    sendResult: function(resp, result) {
        if (result == null) {
            result = {};
        }
        if (_.isArray(result)) {
            var _arr = [];
            result.forEach(function(item) {
                if(item != null) {
                    if (typeof item.toJSON != 'undefined') {
                        _arr.push(item.toJSON("public"));
                    } else {
                        _arr.push(item);
                    }
                }
            });
            result = _arr;
            arr = null;
        } else if (typeof result.toJSON != 'undefined') {
            result = result.toJSON("public");
        }
        return resp.send(result);
        result = null;
    },

    send200: function(res) {
        res.send({ok:true});
    },

    send403: function(res) {
        console.log('before send403');
        res.send(403, {code:403, status:'fail', message:'Unauthorized', detail:'You are not authorized to complete this action.'});
        console.log('after send403');
    },


    wrapError: function(resp, code, status, message, detail) {
        if (_.isObject(message)) {
            if (message.error != null && _.isObject(message.error)) {
                message = message.error;
            }
            if (message.code != null) {
                code = message.code;
            }
            if (message.status != null) {
                status = message.status;
            }
            if (message.message != null) {
                message = message.message;
            }

        }
        var response = {
            code:code || 500,
            status:status || "fail",
            message:message || "An error occurred",
            detail: detail || ""
        };

        //override if we have a code in the message value
        if (_.isNumber(message)) {
            response.code = message;
            response.message = response.detail;
        }
        resp.send(response.code, response);
        response = null;
    },


    ping: function(req, resp) {
        var result = {
            ping: "pong",
            pingDao: ""
        };

        if (this.dao != null) {
            this.dao.ping()
                .done(function(pong){
                    result.pingDao = pong;
                })
                .fail(function(){
                    result.pingDao = "fail";
                })
                .always(function(){
                    resp.send(result);
                });
        } else {
            result.pingDao = "No DAO Defined";
            resp.send(result);
        }
    },

    checkPermission: function(req, priv, cb) {
        this.sm.hasPermission(this.userId(req), this.accountId(req), priv, cb);
    },

    checkPermissionForAccount: function(req, priv, accountId, cb) {
        this.sm.hasPermission(this.userId(req), accountId, priv, cb);
    },

    checkPermissionForAccountAndUser: function(userId, accountId, priv, cb) {
        //console.log('checkPermissionForAccountAndUser(' + userId + ',' + accountId +',' + priv + ',' + cb + ')');
        this.sm.hasPermission(userId, accountId, priv, cb);
    },

    checkPermissionAndSendResponse: function(req, priv, res, successObj) {
        var self = this;
        self.checkPermission(req, priv, function(err, isAllowed){
            if(isAllowed === true) {
                res.send(successObj);
            } else {
                self.send403(res);
            }
        });
    },

    getAccessToken: function(req) {

        var token = null;
        if(req.session.stripeAccessToken) {
            token = req.session.stripeAccessToken;
        } else if(req.user && req.user.get('credentials')){
            var credentials = req.user.get('credentials');
            for(var i=0; i<credentials.length; i++) {
                var cred = credentials[i];
                if(cred.socialId === 'stripe') {
                    req.session.stripeAccessToken = cred.accessToken;
                    return cred.accessToken;
                }
            }
        }
        //if the token is still null here, we need to connect with stripe still

        return token;
    },

    getStripeTokenFromAccount: function(req, fn) {
        var self = this;
        self.log.debug('>> getStripeTokenFromAccount');
        var token = null;
        if(req.session.stripeAccessToken) {
            return fn(null, req.session.stripeAccessToken);
        } else {
            var accountId = parseInt(self.accountId(req));
            if(accountId !== appConfig.mainAccountID) {
                accountDao.getStripeTokensFromAccount(accountId, function(err, creds){
                    if(creds && creds.accessToken) {
                        req.session.stripeAccessToken = creds.accessToken;
                        return fn(null, req.session.stripeAccessToken);
                    } else {
                        return fn(null, null);
                    }
                });
            } else {
                return fn(null, null);
            }

        }
    },

    getStripeTokenFromUnAuthenticatedAccount: function(req, fn) {
        var self = this;
        self.log.debug('>> getStripeTokenFromUnAuthenticatedAccount');
        var token = null;
        if(req.session.stripeAccessToken) {
            return fn(null, req.session.stripeAccessToken);
        } else {
            var accountId = parseInt(self.currentAccountId(req));
            accountDao.getStripeTokensFromAccount(accountId, function(err, creds){
                if(creds && creds.accessToken) {
                    req.session.stripeAccessToken = creds.accessToken;
                    return fn(null, req.session.stripeAccessToken);
                } else {
                    return fn(null, null);
                }
            });
        }
    },

    createUserActivity: function(req, type, note, detail, fn) {
        var self = this;
        var userId = self.userId(req);
        var accountId = self.accountId(req);

        var activity = new $$.m.UserActivity({
            accountId: accountId,
            userId: userId,
            activityType: type,
            note: note,
            detail:detail
        });
        userActivityManager.createUserActivity(activity, function(err, value){
            return fn(err, value);
        });
    },

    createUserActivityWithParams: function(accountId, userId, type, note, detail, fn) {
        var activity = new $$.m.UserActivity({
            accountId: accountId,
            userId: userId,
            activityType: type,
            note: note,
            detail:detail
        });
        userActivityManager.createUserActivity(activity, function(err, value){
            return fn(err, value);
        });
    }

});


$$.api = $$.api || {};
$$.api.BaseApi = apiBase;

module.exports = apiBase;
