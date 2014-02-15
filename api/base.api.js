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

        app.get(this.getUrlRoute('ping'), this.ping.bind(this));

        this.log = global.getLogger(this.base + ".api");

        if (this.initialize != 'undefined') {
            this.initialize();
        }
    },


    getUrlRoute: function(route, version, overrideBase) {
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


    isAuthApi: function(req, resp, next) {
        if (req.isAuthenticated()) {
            return next()
        }

        return this.wrapError(resp, 401, "Not Authenticated", "User is not authenticated");
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
