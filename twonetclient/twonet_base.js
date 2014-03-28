var https = require('https');
_ = require('underscore');

var twoNetBase = function() {
    this.init.apply(this, arguments);
}

_.extend(twoNetBase.prototype, {

    RESPONSE_STATUS: { OK: "OK" },

    KEY: "36ODKJ1HdJD1y29hk203",

    SECRET: "OMItCcxnrlI0db67HhPKkIM70ZhHZcJe",

    BASE_HOST: "twonetcom.qualcomm.com",

    BASE_PATH: "/kernel",

    HTTP_METHOD: { GET: "GET", POST: "POST", DELETE: "DELETE"},

    init: function(options) {
        options = options || {};
    },

    twonetOptions: function (httpMethod, endpoint) {
        return {
            hostname: this.BASE_HOST,
            port: 443,
            path: this.BASE_PATH + endpoint,
            method: httpMethod,
            headers: {
                "Authorization": "Basic " + new Buffer(this.KEY + ":" + this.SECRET).toString('base64'),
                "Accept": "application/json",
                "Content-type": "application/json"
            }
        };
    },

    httpRequest: function(method, url, body, callback) {

        var options = this.twonetOptions(method, url);
        this.logUrl(options);

        var req = https.request(options, function(res) {
            console.log("==> Response status code: " + res.statusCode);

            res.on('data', function(data) {
                var response = JSON.parse(data);
                console.log("==> Response: " + JSON.stringify(response));
                if (res.statusCode != 200) {
                    return callback(new Error(JSON.stringify(response)), null);
                }

                return callback(null, response);
            });
        });

        if (body) {
            var bodyStr = JSON.stringify(body);
            console.log("==> Request: " + bodyStr);
            req.write(bodyStr);
        }

        req.end();
    },

    convertToArray: function(obj) {
        if (obj instanceof Array) {
            return obj;
        }

        var objArray = new Array();

        if (!obj) {
            return objArray;
        }

        objArray.push(obj);
        return objArray;
    },

    logUrl: function(options) {
        console.log('\n' + options.method + ' https://' + options.hostname + options.path);
    }
});

module.exports = twoNetBase;