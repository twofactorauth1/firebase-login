/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var cookies = require('../utils/cookieutil');
var authenticationDao = require('../dao/authentication.dao');
var securityManager = require('../security/sm');
var logger = $$.g.getLogger("baserouter");
var urlUtils = require('../utils/urlutils.js');

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
        /*
         * If we have a session but no session accountId OR the session host doesn't match current host, do the following
         */
        if (req["session"] != null && (req.session["accountId"] == null || self.matchHostToSession(req)===false)) {
            var accountDao = require("../dao/account.dao");
            accountDao.getAccountByHost(req.get("host"), function(err, value) {
                if (!err && value != null) {
                    if (value === true) {
                        logger.warn('We should not reach this code.  value ===true');
                        logger.debug("host: " + req.get("host") + " -> accountId:0");
                        req.session.accountId = 0;
                    } else {
                        logger.debug("host: " + req.get("host") + " -> accountId:" + value.id());
                        req.session.accountId = value.id();
                        req.session.subdomain = value.get('subdomain');
                        req.session.domain = value.get('domain');
                    }
                } else {
                    logger.warn("No account found from getAccountByHost");
                }

                return next();
            });
        } else {
            return next();
        }
    },

    setupForSocialAuth: function(req, resp, next) {
        //TODO: Cache Account By Host
        var self = this;
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
                        logger.debug("host: " + req.get("host") + " -> accountId:" + value.id());
                        req.session.accountId = value.id();
                        req.session.subdomain = value.get('subdomain');
                        req.session.domain = value.get('domain');
                    }
                } else {
                    logger.warn("No account found from getAccountByHost");
                }

                return next();
            });
        } else {
            return next();
        }
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

    isHomeAuth: function(req, resp, next) {
        var self = this;
        logger.debug('>> isHomeAuth (' + req.originalUrl + ')');
        var path = req.url;
        if (req.isAuthenticated()) {
            if(urlUtils.getSubdomainFromRequest(req).isMainApp === true) {
                //need to redirect
                if(req.session.accountId === -1) {
                    //magic number meaning user is authenticated but has multiple accounts
                    logger.debug('returning next');
                    return next();
                }
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
            } else {
                if(req.originalUrl.indexOf('authtoken') === -1) {
                    logger.debug('<< isAuth');
                    return next();
                } else {

                    var redirectUrl = req.originalUrl.replace(/\?authtoken.*/g, "");
                    logger.debug('redirecting to ' + redirectUrl);
                    return resp.redirect(redirectUrl);
                }

            }
        }

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
                        logger.error('Error in checkAuthToken: ' + err);
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
                    logger.error('Error in checkAuthToken: ' + err);
                    cookies.setRedirectUrl(req, resp);
                    logger.debug('Redirecting to /login');
                    return resp.redirect("/login");
                }
            });
        }

    },


    isAuth: function(req, resp, next) {
        var self = this;
        logger.debug('>> isAuth (' + req.originalUrl + ')');
        var path = req.url;
        if (req.isAuthenticated() && (self.matchHostToSession(req) || req.originalUrl.indexOf('authtoken') !== -1)) {
            logger.debug('isAuthenticated');
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
                            logger.debug('redirecting to ' + value);
                            accountDao.getAccountByID(req.session.accountId, function(err, account){
                                if(err) {
                                    logger.error('Error getting account by session value: ' +err);
                                    logger.debug('redirecting to /home');
                                    resp.redirect("/home");
                                    self = null;
                                    return;
                                } else {
                                    logger.debug('Setting subdomain to: ' + account.get('subdomain'));
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
                    logger.debug('<< isAuth');
                    return next();
                } else {

                    var redirectUrl = req.originalUrl.replace(/\?authtoken.*/g, "");
                    logger.debug('redirecting to ' + redirectUrl);
                    return resp.redirect(redirectUrl);
                }

            }
        } else if(req.isAuthenticated() && self.matchHostToSession(req) === false){
            logger.debug('authenticated to the wrong session.  logging out.');
            req.logout();
            resp.redirect('/login');
        } else {
            logger.debug('Not authenticated');
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
                logger.debug('No accountId in session');
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
                            logger.error('Error in checkAuthToken: ' + err);
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
                        logger.error('Error in checkAuthToken: ' + err);
                        cookies.setRedirectUrl(req, resp);
                        logger.debug('Redirecting to /login');
                        return resp.redirect("/login");
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
            return (req.session.accountId == null || req.session.accountId == 0) ? 0 : req.session.accountId;
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
    }
});

$$.r.BaseRouter = baseRouter;
module.exports = baseRouter;