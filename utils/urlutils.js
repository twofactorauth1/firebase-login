/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

var urlutils = {

    getSubdomainFromRequest: function (req) {
        var host = req.get("host");

        return this.getSubdomainFromHost(host);
    },


    getSubdomainFromHost: function (host) {
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
        host = host.replace("www", "");
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
