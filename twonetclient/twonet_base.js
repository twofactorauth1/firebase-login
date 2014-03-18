_ = require('underscore');

var twoNetBase = function() {
    this.init.apply(this, arguments);
}

_.extend(twoNetBase.prototype, {

    KEY: "36ODKJ1HdJD1y29hk203",

    SECRET: "OMItCcxnrlI0db67HhPKkIM70ZhHZcJe",

    BASE_HOST: "twonetcom.qualcomm.com",

    BASE_PATH: "/kernel",

    HTTP_METHOD: { GET: "GET", POST: "POST", DELETE: "DELETE"},

    init: function(options) {
        options = options || {};
    },

    twonetHeaders: function() {
        return {
            "Authorization": "Basic " + new Buffer(this.KEY + ":" + this.SECRET).toString('base64'),
            "Accept": "application/json",
            "Content-type": "application/json"
        };
    },

    twonetOptions: function(httpMethod, endpoint) {
        return {
            hostname: this.BASE_HOST,
            port: 443,
            path: this.BASE_PATH + endpoint,
            method: httpMethod,
            headers: this.twonetHeaders()
        };
    },

    makeUrl: function(options) {
        return options.method + ' https://' + options.hostname + options.path;
    }
});

module.exports = twoNetBase;