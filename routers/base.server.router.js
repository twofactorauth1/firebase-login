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
        if (req["session"] != null && req.session["accountId"] == null) {
            var accountDao = require("../dao/account.dao");
            accountDao.getAccountByHost(req.get("host"), function(err, value) {
                if (!err && value != null) {
                    if (value === true) {
                        logger.debug("host: " + req.get("host") + " -> accountId:0");
                        req.session.accountId = 0;
                    } else {
                        logger.debug("host: " + req.get("host") + " -> accountId:" + value.id());
                        req.session.accountId = value.id();
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
        if (req.isAuthenticated()) {
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