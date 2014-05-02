var request = require('request');
_ = require('underscore');

var twoNetBase = function() {
    this.init.apply(this, arguments);
}

var processHttpResponse = function(error, response, body, httpClientCallback) {
    console.debug("==> Response status code: " + response.statusCode);
    if (error) {
        httpClientCallback(error, null);
    } else {
        console.debug("==> Response: " + JSON.stringify(body));
        if (response.statusCode != 200) {
            return httpClientCallback(new Error(JSON.stringify(body)), null);
        }

        return httpClientCallback(null, body);
    };
}

_.extend(twoNetBase.prototype, {

    RESPONSE_STATUS: { OK: "OK" },

    KEY: "36ODKJ1HdJD1y29hk203",

    SECRET: "OMItCcxnrlI0db67HhPKkIM70ZhHZcJe",

    BASE_PATH: "https://twonetcom.qualcomm.com/kernel",

    init: function(options) {
        options = options || {};
    },

    twonetOptions: function (endpoint, json) {
        var options = {};

        options.url = this.BASE_PATH + endpoint;
        options.headers = {
                'Authorization': "Basic " + new Buffer(this.KEY + ":" + this.SECRET).toString('base64'),
                'Accept': "application/json",
                'Content-type': "application/json"
        };

        console.debug(options.url);

        if (json) {
            console.debug("==> Request Body: " + JSON.stringify(json));
            options.json = json;
        } else {
            options.json = {};
        }

        return options;
    },

    httpGet: function(url, httpClientCallback) {
        request.get(this.twonetOptions(url, null), function(error, response, body) {
            processHttpResponse(error, response, body, httpClientCallback);
        });
    },

    httpPost: function(url, body, httpClientCallback) {
        request.post(this.twonetOptions(url, body), function(error, response, body) {
            processHttpResponse(error, response, body, httpClientCallback);
        });
    },

    httpDelete: function(url, httpClientCallback) {
        request.del(this.twonetOptions(url, null), function(error, response, body) {
            processHttpResponse(error, response, body, httpClientCallback);
        });
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
    }
});

module.exports = twoNetBase;