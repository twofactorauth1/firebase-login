var request = require('request');
_ = require('underscore');
var twonetConfig = require('../../../configs/twonet.config');

var twonetBase = function(){

}

_.extend(twonetBase.prototype, {

    RESPONSE_STATUS: { OK: "OK" },

    KEY: twonetConfig.TWONET_KEY,

    SECRET: twonetConfig.TWONET_SECRET,

    BASE_PATH: twonetConfig.TWONET_BASEPATH,

    init: function() {
        this.log = $$.g.getLogger(this.name || "twonet_base");
        return this;
    },

    twonetOptions: function (endpoint, json) {
        var options = {};

        options.url = this.BASE_PATH + endpoint;
        options.headers = {
                'Authorization': "Basic " + new Buffer(this.KEY + ":" + this.SECRET).toString('base64'),
                'Accept': "application/json",
                'Content-type': "application/json"
        };

        this.log.debug(options.url);

        if (json) {
            this.log.debug("==> Request Body: " + JSON.stringify(json));
            options.json = json;
        } else {
            options.json = {};
        }

        return options;
    },

    httpGet: function(url, httpClientCallback) {
        var self = this;
        request.get(this.twonetOptions(url, null), function(error, response, body) {
            self._processHttpResponse(error, response, body, httpClientCallback);
        });
    },

    httpPost: function(url, body, httpClientCallback) {
        var self = this;
        request.post(this.twonetOptions(url, body), function(error, response, body) {
            self._processHttpResponse(error, response, body, httpClientCallback);
        });
    },

    httpDelete: function(url, httpClientCallback) {
        var self = this;
        request.del(this.twonetOptions(url, null), function(error, response, body) {
            self._processHttpResponse(error, response, body, httpClientCallback);
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
    },

    _processHttpResponse: function(error, response, body, httpClientCallback) {
        this.log.debug("==> Response status code: " + response.statusCode);
        if (error) {
            httpClientCallback(error, null);
        } else {
            this.log.debug("==> Response: " + JSON.stringify(body));
            if (response.statusCode != 200) {
                return httpClientCallback(new Error(JSON.stringify(body)), null);
            }

            return httpClientCallback(null, body);
        }
    }
});

module.exports = twonetBase;