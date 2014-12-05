/*
 * taken from https://github.com/urlbox-io/urlbox_node
 * NOT in npm registry
 */

var crypto = require('crypto');
var util = require('util');
var urlboxConfig = require('../configs/urlbox.config');

var URLBOX = {

    getUrl: function(url, options) {

        var apiKey = urlboxConfig.URLBOX_KEY;
        var apiSecret = urlboxConfig.URLBOX_SECRET;

        var encodedUrl = encodeURIComponent(url);
        var queryString = "url=" + encodedUrl;

        if (options.width) {

            queryString += "&width=" + options.width;
        }
        if (options.height) {

            queryString += "&height=" + options.height;
        }
        if (options.full_page) {
            queryString += "&full_page=" + options.full_page;
        }

        if (options.force) {

            queryString += "&force=" + options.force;
        }

        var token = crypto.createHmac("sha1", apiSecret).update(queryString).digest("hex")


        var constructedUrl = util.format(urlboxConfig.URLBOX_URLTEMPLATE, apiKey, token, queryString);

        console.log(constructedUrl);

        return constructedUrl;

    }

}

module.exports = URLBOX;