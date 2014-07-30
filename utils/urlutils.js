/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var tldtools = require('tldtools').init();
var _log = $$.g.getLogger("urlutils");

var urlutils = {

    getSubdomainFromRequest: function (req) {
        var host = req.get("host");

        return this.getSubdomainFromHost(host);
    },

    getSubdomainFromHost: function(host) {
        _log.debug('>> getSubdomainFromHost(' + host + ')');
        var self = this
            , defaultHost = process.env.ROOT_HOST || "indigenous"
            , globalSubdomains = process.env.GLOBAL_SUBDOMAINS || "www"
            , globalEnvironments = process.env.GLOBAL_ENVIRONMENTS || 'test'
            , hosts
            , subdomain
            , domain
            , tld
            , isMainApp = false;

        globalSubdomains = globalSubdomains.split(",");


        if(host) {
            //tldtools wants a fully-qualified domain... we need to add http.
            var obj = tldtools.extract('http://' + host);

            //replace 'www' (and a trailing '.' if its there) from the beginning of the string with an empty string
            subdomain = obj.subdomain.replace(/^www\.?/gi, '');
            if(subdomain === '') {
                subdomain = null;
                isMainApp = true;
            } else {
                /*
                 * Check if we have an environment modifier in the subdomain.
                 * In case the subdomain IS an environment modifier, we need
                 * to handle that as well.
                 */
                var modifier = '';
                if(subdomain.indexOf('.') > -1) {
                    var ary = subdomain.split('.');
                    modifier = ary[ary.length-1];
                } else {
                    modifier = subdomain;
                }

                var matchedEnvironment = _.filter(globalEnvironments.split(','), function(_env){return modifier === _env});
                if(matchedEnvironment && matchedEnvironment.length > 0) {
                    _log.debug('environment: ' + matchedEnvironment);
                    var regexp = new RegExp('.?' + matchedEnvironment[0], 'gi');
                    subdomain = subdomain.replace(regexp, '');
                }
                /*
                 * After checking for environment... check for empty subdomain again.
                 */
                if(subdomain === '') {
                    subdomain = null;
                    isMainApp = true;
                }
            }

            domain = obj.domain;
            tld = obj.tld;
        }

        //check if the subdomain matches a list of globalSubdomains that indicate mainApp
        if(subdomain != null && _.contains(globalSubdomains.toString().split(','), subdomain)){
            isMainApp = true;
        }
        var returnObj = {
            'isMainApp': isMainApp,
            'subdomain': subdomain,
            'domain': domain
        };
        _log.debug('isMainApp:' + returnObj.isMainApp + ', subdomain:' + returnObj.subdomain + ', domain:' + returnObj.domain );
        return returnObj;
    },

    /**
     * Deprecated.
     * @param host
     * @returns {{isMainApp: boolean, subdomain: *, domain: *}}
     * @private
     */
    _getSubdomainFromHost: function (host) {
        var self = this
            , defaultHost = process.env.ROOT_HOST || "indigenous"
            , globalSubdomains = process.env.GLOBAL_SUBDOMAINS || "www"
            , hosts
            , subdomain
            , domain
            , isMainApp = false;

        globalSubdomains = globalSubdomains.split(",");

        //If we're length one and hosts[0] == defaultHost, then it's ok
        //If we're length two and hosts[0] == www and hosts[1] == defaultHost, then its ok
        //If we're length two and hosts[1] == defaultHost, we need to check account.subdomain
        //If we're length one, we need to check hosts[0] against our account.domain
        //if we're length two+ and hosts[0] == www, we need to check hosts[1+] against our account.domain

        var oHost = host;
        host = host.replace("www.", "");
        var portIndex = host.indexOf(":");
        if (portIndex > -1) {
            host = host.substr(0, portIndex);
        }


        hosts = host.split(".");





        if (hosts[0] == "localhost") {
            isMainApp = true;
            subdomain = "localhost";
        } else {
            if (hosts.length == 1 && hosts[0] == defaultHost) {
                isMainApp = true;
                subdomain = hosts[0];
            } else if (hosts.length == 2 && hosts[0] == defaultHost) {
                isMainApp = true;
                subdomain = hosts[0];
            } else if (hosts.join(".") == defaultHost) {
                subdomain = defaultHost;
                isMainApp = true;
            } else if ((hosts.length == 2 || hosts.length == 3)) {
                if (hosts[1] == defaultHost) {
                    subdomain = hosts[0];
                } else if (hosts.length == 3 && (hosts[1] + "." + hosts[2]) == defaultHost) {
                    subdomain = hosts[0];
                }
                if (subdomain != null && globalSubdomains.indexOf(subdomain) > -1) {
                    isMainApp = true;
                } else if (subdomain == null) {
                    domain = hosts.join(".");
                }
            } else {
                domain = hosts.join("."); //custom domain
            }
        }

        return {
            isMainApp: isMainApp,
            subdomain: subdomain,
            domain: domain
        };
    }
};

module.exports = urlutils;
