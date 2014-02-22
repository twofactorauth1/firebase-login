var apiBase = function(options) {
    this.init.apply(this, arguments);
};

_.extend(apiBase.prototype, {

    log: null,

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

        if (this.initialize != 'undefined') {
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


    isAuthApi: function(req, resp, next) {
        if (req.isAuthenticated()) {
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


    sendResult: function(resp, result) {
        if (_.isArray(result)) {
            var _arr = [];
            result.forEach(function(item) {
               if (typeof item.toJSON != undefined) {
                   _arr.push(item.toJSON("public"));
               } else {
                   _arr.push(item);
               }
            });
            result = _arr;
        } else if (typeof result.toJSON != undefined) {
            result = result.toJSON("public");
        }
        return resp.send(result);
    },


    accountId: function(req) {
        try {
            return (req.session.accountId == null || req.session.accountId == 0) ? 0 : req.session.accountId;
        }catch(exception) {
            return null;
        }
    },


    wrapError: function(resp, code, status, message, detail) {
        var response = {
            code:code || 500,
            status:status || "fail",
            message:message || "An error occurred",
            detail: detail || ""
        }

        //override if we have a code in the message value
        if (_.isNumber(message)) {
            response.code = message;
            response.message = response.detail;
        };
        resp.send(response.code, response);
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
    }
});


$$.api = $$.api || {};
$$.api.BaseApi = apiBase;

module.exports = apiBase;
