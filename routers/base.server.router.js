/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var cookies = require('../utils/cookieutil');
var authenticationDao = require('../dao/authentication.dao');
var securityManager = require('../security/sm')(false);
var logger = $$.g.getLogger("baserouter");
var urlUtils = require('../utils/urlutils.js');
var accountDao = require("../dao/account.dao");
var appConfig = require('../configs/app.config');
var userActivityManager = require('../useractivities/useractivity_manager');

var baseRouter = function(options) {
    this.init.apply(this, arguments);
};

_.extend(baseRouter.prototype, {

    log: null,

    sm: securityManager,

    init: function(options) {
        options = options || {};

        if (options.base) {
            this.base = options.base;
        }

        if (this.base == null) {
            this.base = "base";
        }

        this.log = $$.g.getLogger(this.base + ".router");

        if (this.initialize != 'undefined') {
            this.initialize();
        }
    },


    setup: function(req, resp, next) {
        //TODO: Cache Account By Host
        var self = this;
        accountDao.getAccountByHost(req.get("host"), function(err, value) {
            if (!err && value != null) {
                if (value === true) {
                    logger.warn('We should not reach this code.  value ===true');
                    logger.debug("host: " + req.get("host") + " -> accountId:0");
                    req.session.accountId = 0;
                } else {
                    logger.trace("host: " + req.get("host") + " -> accountId:" + value.id());
                    req.session.unAuthAccountId = value.id();
                    req.session.unAuthSubdomain = value.get('subdomain');
                    req.session.unAuthDomain = value.get('domain');
                    //req.session.locked = value.get('locked');
                }
            } else {
                logger.warn("No account found from getAccountByHost");
                return resp.redirect(appConfig.www_url + "/404");
            }
            return next();

        });

    },

    setupForSocialAuth: function(req, resp, next) {
        //TODO: Cache Account By Host
        var self = this;
        accountDao.getAccountByHost(req.get("host"), function(err, value) {
            if (!err && value != null) {
                if (value === true) {
                    logger.warn('We should not reach this code.  value ===true');
                    logger.debug("host: " + req.get("host") + " -> accountId:0");
                    req.session.accountId = 0;
                } else {
                    logger.trace("host: " + req.get("host") + " -> accountId:" + value.id());
                    req.session.unAuthAccountId = value.id();
                    req.session.unAuthSubdomain = value.get('subdomain');
                    req.session.unAuthDomain = value.get('domain');
                }
            } else {
                logger.warn("No account found from getAccountByHost");
            }

            return next();
        });
    },

    setupForSocialSignup: function(req, resp, next) {
        //TODO: Cache Account By Host
        var self = this;
        logger.debug('>> setupForSocialSignup');
        /*
         * If we have a session but no session accountId OR the session host doesn't match current host, do the following
         */
        if (req["session"] != null && (req.session["accountId"] == null )) {
            var accountDao = require("../dao/account.dao");
            accountDao.getAccountByHost(req.get("host"), function(err, value) {
                if (!err && value != null) {
                    if (value === true) {
                        logger.warn('We should not reach this code.  value ===true');
                        logger.debug("host: " + req.get("host") + " -> accountId:0");
                        req.session.accountId = 0;
                    } else {
                        logger.trace("host: " + req.get("host") + " -> accountId:" + value.id());
                        req.session.unAuthAccountId = 'new';
                        req.session.unAuthSubdomain = 'new';
                        req.session.unAuthDomain = value.get('domain');
                    }
                } else {
                    logger.warn("No account found from getAccountByHost");
                }

                return next();
            });
        } else {
            logger.trace('setting session account and subdomain to new');
            //req.session.accountId = 'new';
            //req.session.subdomain = 'new';
            req.session.unAuthAccountId = 'new';
            req.session.unAuthSubdomain = 'new';
            return next();
        }
    },

    frontendSetup: function(req, resp, next) {
        var self = this;
        accountDao.getAccountByHost(req.get("host"), function(err, value) {
            if (!err && value != null) {
                logger.debug("host: " + req.get("host") + " -> accountId:" + value.id());
                req.session.unAuthAccountId = value.id();
                req.session.unAuthSubdomain = value.get('subdomain');
                req.session.unAuthDomain = value.get('domain');
            } else {
                logger.warn("No account found from getAccountByHost");
                return resp.redirect(appConfig.www_url + "/404");
            }
            return next();
        });
    },

    matchHostToSession: function(req) {
        var subObj = urlUtils.getSubdomainFromHost(req.host);
        var sSub = req.session.subdomain;
        var sDom = req.session.domain;
        if(sSub=== null && sDom===null) {//nothing to match
            logger.trace('matchHostToSession - nothing to match.  false');
            return false;
        }

        if(subObj.isMainApp === true) {
            var mainAppTest =  (sSub === 'www' || sSub === 'main' || sSub==='app' || sSub ==='');
            logger.trace('matchHostToSession - mainAppTest: ' + mainAppTest);
            return mainAppTest;
        }
        var matchHostToSessionTest = (sSub === subObj.subdomain || sDom === subObj.domain);
        logger.trace('matchHostToSession test: ' + matchHostToSessionTest);
        return matchHostToSessionTest;
    },

    isHomeAuth: function(req, resp, next) {
        var self = this;
        logger.debug('>> isHomeAuth (' + req.originalUrl + ') session accountId: ' + req.session.accountId);
        var path = req.url;
        if (req.isAuthenticated()) {
            if(urlUtils.getSubdomainFromRequest(req).isMainApp === true) {
                //need to redirect
                if(req.session.accountId === -1) {
                    //magic number meaning user is authenticated but has multiple accounts
                    logger.debug('returning next');
                    return next();
                } else {
                    authenticationDao.getAuthenticatedUrlForRedirect(req.session.accountId, req.user.id(), req.url,
                        function(err, value){
                            if (err) {
                                logger.error('Error getting authenticated url for redirect: ' + err);
                                logger.debug('redirecting to /home');
                                resp.redirect("/home");
                                self = null;
                                return;
                            } else {
                                value.replace(/\?authtoken.*/g, "");
                                logger.debug('redirecting to ' + value);
                                resp.redirect(value);
                                self = null;
                            }
                        }
                    );
                }

            } else {
                if(req.originalUrl.indexOf('authtoken') === -1) {
                    logger.debug('<< isHomeAuth');
                    return next();
                } else {

                    var redirectUrl = req.originalUrl.replace(/\?authtoken.*/g, "");
                    logger.debug('redirecting to ' + redirectUrl);
                    return resp.redirect(redirectUrl);
                }

            }
        } else {
            var checkAuthToken = function(req, fn) {
                if (req.query.authtoken != null) {
                    var accountId = 0;
                    if (req["session"] != null) {
                        accountId = req.session.accountId;
                    }
                    authenticationDao.verifyAuthToken(accountId, req.query.authtoken, true, function(err, value) {
                        if (err) {
                            return fn(err);
                        }

                        req.login(value, function(err) {
                            if (err) {
                                return fn(err);
                            }
                            return fn(null, value);//here
                        });
                    });
                } else {
                    return fn("No auth token found");
                }
            };

            if (req["session"] != null && req.session["accountId"] == null) {
                var accountDao = require("../dao/account.dao");
                accountDao.getAccountByHost(req.get("host"), function(err, value) {
                    if (!err && value != null) {
                        if (value === true) {
                            req.session.accountId = 0;
                        } else {
                            req.session.accountId = value.id();
                        }
                    }

                    checkAuthToken(req, function(err, value) {
                        if (!err) {
                            //need to remove the auth token here.
                            var redirectUrl = req.url.replace(/\?authtoken.*/g, "");
                            logger.debug('<< isAuth.  Redirecting to: ' + redirectUrl);
                            return resp.redirect(redirectUrl);
                        } else {
                            logger.error('Error in checkAuthToken(1): ' + err);
                            cookies.setRedirectUrl(req, resp);
                            logger.debug('Redirecting to /login');
                            return resp.redirect("/login");
                        }
                    });
                });
            } else {
                checkAuthToken(req, function(err, value) {
                    if (!err) {
                        //need to remove the auth token here.
                        var redirectUrl = req.url.replace(/\?authtoken.*/g, "");
                        logger.debug('<< isAuth.  Redirecting to: ' + redirectUrl);
                        return resp.redirect(redirectUrl);
                    } else {
                        logger.error('Error in checkAuthToken(2): ' + err);
                        cookies.setRedirectUrl(req, resp);
                        logger.debug('Redirecting to /login');
                        return resp.redirect("/login");
                    }
                });
            }
        }



    },


    isAuth: function(req, resp, next) {
        var self = this;
        logger.trace('>> isAuth (' + req.originalUrl + ')');
        logger.trace('session accountId: ' + req.session.accountId + ' session sub: ' + req.session.subdomain);
        var path = req.url;
        logger.trace('path:', path);
        var redirectParam = req.query.redirectTo;
        //logger.debug('req.session.locked: ' + req.session.locked);
        // if(req.session.locked === 'true' || req.session.locked === true) {
        //     return resp.redirect('/interim.html');
        // }
        if (req.isAuthenticated() && (self.matchHostToSession(req) || req.originalUrl.indexOf('authtoken') !== -1) && req.session.midSignup !== true) {
            logger.trace('isAuthenticated');
            if(urlUtils.getSubdomainFromRequest(req).isMainApp === true) {
                //need to redirect

                authenticationDao.getAuthenticatedUrlForRedirect(req.session.accountId, req.user.id(), req.url,
                    function(err, value){
                        if (err) {
                            logger.error('Error getting authenticated url for redirect: ' + err);
                            logger.debug('redirecting to /home');
                            resp.redirect("/home");
                            self = null;
                            return;
                        } else {
                            value.replace(/\?authtoken.*/g, "");
                            logger.trace('redirecting to ' + value);
                            accountDao.getAccountByID(req.session.accountId, function(err, account){
                                if(err || !account) {
                                    logger.error('Error getting account by session value: ' +err);
                                    logger.debug('redirecting to /home');
                                    resp.redirect("/home");
                                    self = null;
                                    return;
                                } else {
                                    logger.trace('Setting subdomain to: ' + account.get('subdomain'));
                                    req.session.subdomain = account.get('subdomain');
                                    req.session.domain = account.get('domain');
                                    resp.redirect(value);
                                    self = null;
                                    return;
                                }
                            });

                        }
                    }
                );
            } else {
                if(req.originalUrl.indexOf('authtoken') === -1) {
                    logger.trace('<< isAuth');
                    if(req.session.accountId === -1) {
                        logger.debug('redirecting to /home');
                        return resp.redirect('/home');
                    }
                    return next();
                } else {

                    var redirectUrl = req.originalUrl.replace(/\?authtoken.*/g, "");
                    logger.trace('redirecting to ' + redirectUrl);
                    return resp.redirect(redirectUrl);
                }

            }
        } else if(req.isAuthenticated() && (self.matchHostToSession(req) === false || req.session.midSignup === true)){
            logger.debug('authenticated to the wrong session.  logging out.');
            self.logout(req, resp);
            //cookies.setRedirectUrl(req, resp, path);
            resp.redirect('/login?redirectTo=' + path.replace('/#', ''));
        } else {
            logger.trace('Not authenticated');
            var checkAuthToken = function(req, fn) {
                if (req.query.authtoken != null) {
                    var accountId = 0;
                    if (req["session"] != null) {
                        accountId = req.session.accountId;
                    }
                    authenticationDao.verifyAuthToken(accountId, req.query.authtoken, true, function(err, value) {
                        if (err) {
                            return fn(err);
                        }

                        req.login(value, function(err) {
                            if (err) {
                                return fn(err);
                            }
                            return fn(null, value);//here
                        });
                    });
                } else {
                    return fn("No auth token found");
                }
            };

            if (req["session"] != null && req.session["accountId"] == null) {//TODO: do we need to check matchHostToken here?
                logger.trace('No accountId in session');

                accountDao.getAccountByHost(req.get("host"), function(err, value) {
                    if (!err && value != null) {
                        if (value === true) {
                            req.session.accountId = 0;
                        } else {
                            req.session.accountId = value.id();
                        }
                    }

                    checkAuthToken(req, function(err, value) {
                        if (!err) {
                            //need to remove the auth token here.
                            var redirectUrl = req.url.replace(/\?authtoken.*/g, "");
                            logger.trace('<< isAuth.  Redirecting to: ' + redirectUrl);
                            return resp.redirect(redirectUrl);
                        } else {
                            logger.error('Error in checkAuthToken(3): ' + err);
                            //cookies.setRedirectUrl(req, resp, redirectParam);
                            logger.debug('Redirecting to /login?redirectTo=' + path.replace('/#', ''));
                            return resp.redirect("/login?redirectTo=" + path.replace('/#', ''));
                        }
                    });
                });
            } else {
                checkAuthToken(req, function(err, value) {
                    if (!err) {
                        //need to remove the auth token here.
                        var redirectUrl = req.url.replace(/\?authtoken.*/g, "");
                        logger.trace('<< isAuth.  Redirecting to: ' + redirectUrl);
                        return resp.redirect(redirectUrl);
                    } else {
                        logger.error('Error in checkAuthToken(4): ' + err);
                        //cookies.setRedirectUrl(req, resp, path);
                        logger.debug('Redirecting to /login?redirectTo=' + path.replace('/#', ''));
                        return resp.redirect("/login?redirectTo=" + path.replace('/#', ''));
                    }
                });
            }
        }


    },


    checkAuthToken: function(req, fn) {
        if (req.query.authtoken != null) {
            var accountId = 0;
            if (req["session"] != null) {
                accountId = req.session.accountId;
            }
            authenticationDao.verifyAuthToken(accountId, req.query.authtoken, true, function(err, value) {
                if (err) {
                    return fn(err);
                }

                req.login(value, function(err) {
                    if (err) {
                        return fn(err);
                    }
                    return fn(null, value);
                });
            });
        } else {
            return fn("No auth token found");
        }
    },


    accountId: function(req) {
        try {
            return (req.session.unAuthAccountId === null) ? 0 : req.session.unAuthAccountId;
            //return (req.session.accountId == null || req.session.accountId == 0) ? 0 : req.session.accountId;
        }catch(exception) {
            return null;
        }
    },

    /*
     * This method is used on frontend only calls.  It returns the _unauthenticated_ accountId.
     */
    unAuthAccountId: function(req) {
        try {
            return (req.session.unAuthAccountId === null) ? 0 : req.session.unAuthAccountId;
        }catch(exception) {
            return null;
        }
    },


    userId: function(req) {
        try {
            return req.user.id();
        }catch(exception) {
            return null;
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
    },

    logout: function(req, resp) {
        req.session.cookie = null;
        req.session.accountId = null;
        req.logout();
        req.session.destroy();
        req.session = null;
        req.user = null;
        resp.clearCookie(appConfig.cookie_name, { path: '/' });
    }
});

$$.r.BaseRouter = baseRouter;
module.exports = baseRouter;