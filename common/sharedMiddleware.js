

var logger = $$.g.getLogger("sharedMiddleware");
var accountDao = require('../dao/account.dao');
var appConfig = require('../configs/app.config');

module.exports = {
    log:logger,
    cache: $$.g.cache,

    /**
     * Finds and stores the accountId based on subdomain or customDomain at req.session.unAccountId
     * @param req
     * @param resp
     * @param next
     */
    setup: function(req, resp, next) {
        var self = this;
        return self._setup(req, resp, next, false);
    },

    setupForPages: function(req, resp, next) {
        var self = this;
        return self._setup(req, resp, next, true);
    },

    isAuth: function(req, resp, next) {

    },

    isAuthAndSubscribed: function(req, resp, next) {

    },

    secureAccountId: function(req) {

    },

    unsecureAccountId: function(req) {

    },

    _setup: function(req, resp, next, checkForTrial) {
        var self = this;
        var key = 'host_' + req.get('host');
        $$.g.cache.get(key, null, null, null, function(err, value){
            if(value) {
                logger.trace('From cache-- ' + key + ' -> accountId:' + value.id());
                req.session.unAuthAccountId = value.id();
                req.session.unAuthSubdomain = value.get('subdomain');
                req.session.unAuthDomain = value.get('domain');
                return next();
            } else {
                logger.trace('Not in cache');
                accountDao.getAccountByHost(req.get("host"), function(err, value) {
                    if (!err && value != null) {
                        if(checkForTrial===true && self._hasExpiredTrial(value)) {
                            logger.warn('Expired Trial... redirecting to ' + appConfig.www_url);
                            return resp.redirect(appConfig.www_url);
                        } else {
                            logger.trace("host: " + req.get("host") + " -> accountId:" + value.id());
                            $$.g.cache.set(key, value);
                            req.session.unAuthAccountId = value.id();
                            req.session.unAuthSubdomain = value.get('subdomain');
                            req.session.unAuthDomain = value.get('domain');
                            //req.session.locked = value.get('locked');
                            return next();
                        }
                    } else {
                        logger.warn("No account found from getAccountByHost");
                        return resp.redirect(appConfig.www_url + "/404");
                    }
                });
            }
        });

    },

    _hasExpiredTrial: function(account) {
        var DEFAULT_PLAN = 'NO_PLAN_ARGUMENT';
        var billing = account.get('billing');
        var planID = billing.plan;
        var expired = moment(billing.signupDate).add(billing.trialLength, 'days').isBefore();
        return (planID === DEFAULT_PLAN && expired === true);
    }
};