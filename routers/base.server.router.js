var cookies = require('../utils/cookieutil');

var baseRouter = function(options) {
    this.init.apply(this, arguments);
};

_.extend(baseRouter.prototype, {

    log: null,

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


    setup: function(req,resp, next) {
        if (req["session"] != null && req.session["accountId"] == null) {
            var AccountDao = require("../dao/account.dao");
            AccountDao.getAccountByHost(req.get("host"), function(err, value) {
                if (!err && value != null) {
                    if (value === true) {
                        req.session.accountId = 0;
                    } else {
                        req.session.accountId = value.id();
                    }
                }

                return next();
            });
        } else {
            return next();
        }
    },


    isAuth: function(req, resp, next) {
        if (req.isAuthenticated()) {
            return next()
        }

        if (req["session"] != null && req.session["accountId"] == null) {
            var AccountDao = require("../dao/account.dao");
            AccountDao.getAccountByHost(req.get("host"), function(err, value) {
                if (!err && value != null) {
                    if (value === true) {
                        req.session.accountId = 0;
                    } else {
                        req.session.accountId = value.id();
                    }
                }

                cookies.setRedirectUrl(req,resp);
                resp.redirect("/login");
            });
        } else {
            cookies.setRedirectUrl(req,resp);
            resp.redirect("/login");
        }
    },


    accountId: function(req) {
        try {
            return (req.session.accountId == null || req.session.accountId == 0) ? 0 : req.session.accountId;
        }catch(exception) {
            return null;
        }
    }
});

$$.r.BaseRouter = baseRouter;

module.exports = baseRouter;