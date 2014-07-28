/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var environments = {
    DEVELOPMENT: "development",
    PRODUCTION: "production",
    STAGING: "staging",
    TESTING: "testing"
};

/**
 * Allowed hosts for cross-domain access.
 */
var XDHosts = [];

//This contains the testing server for Charles Szymanski
var DEFAULT_XDHOSTS = ['107.170.183.176'];

if(process.env.XDHOSTS == null) {
    XDHosts = DEFAULT_XDHOSTS;
} else {
    XDHosts = process.env.XDHOSTS.split(',');
}


//---------------------------------------------------------
//  CONFIGURE THESE
//---------------------------------------------------------

if (process.env.NODE_ENV == null) {
    process.env.NODE_ENV = environments.DEVELOPMENT;
}

if (process.env.PORT == null) {
    process.env.PORT = 3000;
}

if (process.env.IS_PROXIED == null){
   process.env.IS_PROXIED = false;
}

/**
 * For local:  indigenous.local, localhost, etc.  -- modify hosts file to point 127.0.0.1 to app.indigenous.local.
 * For production: indigenous.io
 */
if (process.env.ROOT_HOST == null) {
    if(process.env.NODE_ENV == environments.DEVELOPMENT || process.env.NODE_ENV == environments.TESTING) {
        process.env.ROOT_HOST = "indigenous.local";
    } else {
        process.env.ROOT_HOST = "indigenous.io";
    }

}


/**
 * If we have SSL set to true, otherwise false.
 * This is used in Full path URL creation.
 *
 * On production, this should be set in environment variables as true
 */
if (process.env.IS_SECURE == null) {
    process.env.IS_SECURE = "false";
}


/**
 * A "whitelist" of subdomains that are never "account specific".
 * If a use hits one of these, they are at the main indigenous.io app.
 */
process.env.GLOBAL_SUBDOMAINS = "www,home,app";


//---------------------------------------------------------
//  SET UP SERVER_URL
//---------------------------------------------------------

var serverUrl = (process.env.IS_SECURE == "true" || process.env.IS_SECURE == true) ? "https://" : "http://";
serverUrl += "app." + process.env.ROOT_HOST;


if (process.env.PORT && process.env.PORT != 80 && process.env.PORT != 443 && process.env.PORT != 8080 && process.env.IS_PROXIED != "true") {
    serverUrl += ":" + process.env.PORT;
}


//---------------------------------------------------------
// EXPORTS
//---------------------------------------------------------
module.exports = {
    environments: environments,
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    server_url: serverUrl,
    support_email: "support@indigenous.io",
    cluster:false,
    freeCpus:2,
    xdhost_whitelist: XDHosts,

    SIGNATURE_SECRET: "ab#6938kxal39jg&*(#*K_Cd",

    getServerUrl: function(subdomain, domain) {
        if (subdomain == null && domain == null) {
            return serverUrl;
        }

        var _serverUrl = (process.env.IS_SECURE == "true" || process.env.IS_SECURE == true) ? "https://" : "http://";
        if (!String.isNullOrEmpty(domain)) {
            _serverUrl += domain;
        } else {
            _serverUrl += subdomain + "." + process.env.ROOT_HOST;
        }

        if (process.env.PORT && process.env.PORT != 80 && process.env.PORT != 443 && process.env.PORT != 8080 && process.env.IS_PROXIED != "true") {
           _serverUrl += ":" + process.env.PORT;
        }
        return _serverUrl;
    }
};
