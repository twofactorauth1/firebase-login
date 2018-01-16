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

var DEFAULT_XDHOSTS = ['http://localhost:3001', 'pipeshift.com', 's3.amazonaws.com', 'http://test.indigenous.io', 'https://indigenous.io'];

if (process.env.XDHOSTS == null) {
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

if (process.env.IS_PROXIED == null) {
    process.env.IS_PROXIED = false;
}

/**
 * For local:  indigenous.local, localhost, etc.  -- modify hosts file to point 127.0.0.1 to app.indigenous.local.
 * For production: indigenous.io
 */
if (process.env.ROOT_HOST == null) {
    if (process.env.NODE_ENV == environments.DEVELOPMENT || process.env.NODE_ENV == environments.TESTING) {
        process.env.ROOT_HOST = "indigenous.local";
        process.env.ORG_ROOT_HOSTS = 'test.gorvlvr.com,gorvlvr.com,test.techevent.us,techevent.us,test.leadsource.cc,leadsource.cc,newplatform.net';
    } else {
        process.env.ROOT_HOST = "indigenous.io";
        process.env.ORG_ROOT_HOSTS = 'gorvlvr.com,techevent.us,leadsource.cc';
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
process.env.GLOBAL_SUBDOMAINS = "www,app";

/**
 * A comma separated list of strings that represent different environments.
 * These MUST come right before the host.
 * If none are present, production is assumed.
 */
if(process.env.GLOBAL_ENVIRONMENTS == null) {
    process.env.GLOBAL_ENVIRONMENTS = "test,prod,asia,other,angular,blue,green,preprod";
}


/**
 * A configuration for the db ID of the main account.  This can be useful
 * in edge case redirections
 * @type {string}
 */
var MAIN_ACCOUNT_ID = process.env.MAIN_ACCOUNT_ID || 6;

/**
 * A configuration for the db ID of the LeadSource account.  This can be useful
 * in edge case redirections
 * @type {string}
 */
var LEADSOURCE_ORG_ID = process.env.LEADSOURCE_ORG_ID || 5;


//---------------------------------------------------------
//  SET UP SERVER_URL
//---------------------------------------------------------

var serverUrl = (process.env.IS_SECURE == "true" || process.env.IS_SECURE == true) ? "https://" : "http://";
serverUrl += "app." + process.env.ROOT_HOST;
var wwwUrl = (process.env.IS_SECURE == "true" || process.env.IS_SECURE == true) ? "https://" : "http://";
//wwwUrl += "www." + process.env.ROOT_HOST;
wwwUrl += process.env.ROOT_HOST;

var subdomainSuffix = process.env.ROOT_HOST;



if (process.env.PORT && process.env.PORT != 80 && process.env.PORT != 443 && process.env.PORT != 8080 && process.env.IS_PROXIED != "true") {
    serverUrl += ":" + process.env.PORT;
    wwwUrl += ":" + process.env.PORT;
    subdomainSuffix += ":" + process.env.PORT;
}

//---------------------------------------------------------
//  COOKIE NAME
//---------------------------------------------------------

var cookieName = "connect.sid";
if( process.env.ROOT_HOST !== 'indigenous.io') {
    cookieName = 'test_' + cookieName;
}

var nonProduction = true;
if(process.env.ROOT_HOST === 'indigenous.io') {
    nonProduction = false;
}

//---------------------------------------------------------
//  Scheduled Jobs
//---------------------------------------------------------

var runJobs = false;
if(process.env.RUN_SCHEDULED_JOBS === 'true') {
    runJobs = true;
}

//---------------------------------------------------------
//  GROUP ADMIN USERS
//---------------------------------------------------------
var groupAdminUserIDs = process.env.GROUP_ADMIN_USERIDS || '1,4';
groupAdminUserIDs = groupAdminUserIDs.split(',');
//---------------------------------------------------------
// CLUSTERING
//---------------------------------------------------------
var cluster = true;
if(process.env.CLUSTER) {
    cluster = process.env.CLUSTER;
}
//---------------------------------------------------------
// EXPORTS
//---------------------------------------------------------
module.exports = {
    environments: environments,
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    server_url: serverUrl,
    www_url: wwwUrl,
    subdomain_suffix: subdomainSuffix,
    support_email: "support@indigenous.io",
    cluster: cluster,
    freeCpus: 2,
    xdhost_whitelist: XDHosts,
    mainAccountID: MAIN_ACCOUNT_ID,
    leadSourceOrgID: LEADSOURCE_ORG_ID,

    SIGNATURE_SECRET: "ab#6938kxal39jg&*(#*K_Cd",
    cookie_subdomain: '.' + process.env.ROOT_HOST,
    cookie_name: cookieName,
    groupAdminUserIds: groupAdminUserIDs,
    nonProduction:nonProduction,
    trialLength: 30,
    internalSubscription:'EVERGREEN',
    orgInternalSubscriptions:['LEADSOURCE-EVERGREEN'],

    runJobs: runJobs,

    getServerUrl: function (subdomain, domain) {
        if (subdomain == null && domain == null) {
            return wwwUrl;
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
    },

    getOrganizationUrl: function(subdomain, orgDomainSuffix) {
        if(!subdomain && !orgDomainSuffix) {
            return wwwUrl;
        }
        if(!orgDomainSuffix) {
            return this.getServerUrl(subdomain);
        }

        var _serverUrl = (process.env.IS_SECURE == "true" || process.env.IS_SECURE == true) ? "https://" : "http://";

        if(subdomain) {
            _serverUrl += subdomain;
        }
        if(nonProduction) {
            if(process.env.ENV_SUBDOMAIN) {
                _serverUrl += '.' + process.env.ENV_SUBDOMAIN;
            } else {
                _serverUrl += '.test';
            }

        }
        _serverUrl += '.' + orgDomainSuffix;

        if (process.env.PORT && process.env.PORT != 80 && process.env.PORT != 443 && process.env.PORT != 8080 && process.env.IS_PROXIED != "true") {
            _serverUrl += ":" + process.env.PORT;
        }
        return _serverUrl;
    },

    getServerRequestUrl: function (subdomain, domain, protocol) {
        if (subdomain == null && domain == null) {
            return wwwUrl;
        }

        var _serverUrl = protocol + "://";
        if (!String.isNullOrEmpty(domain)) {
            _serverUrl += domain;
        } else {
            _serverUrl += subdomain + "." + process.env.ROOT_HOST;
        }

        if (process.env.PORT && process.env.PORT != 80 && process.env.PORT != 443 && process.env.PORT != 8080 && process.env.IS_PROXIED != "true") {
            _serverUrl += ":" + process.env.PORT;
        }
        return _serverUrl;
    },

    getRequestDomainUrl: function(host, protocol){
        if(!protocol)
            protocol = "http";
        var _serverUrl = protocol + "://";
        _serverUrl += host;

        if (process.env.PORT && process.env.PORT != 80 && process.env.PORT != 443 && process.env.PORT != 8080 && process.env.IS_PROXIED != "true") {
            _serverUrl += ":" + process.env.PORT;
        }
        return _serverUrl;
    },

    getServerDomain: function(subdomain, customDomain) {
        if(!subdomain && !customDomain) {
            return wwwUrl;
        }
        var serverDomain = '';
        if(customDomain) {
            serverDomain = customDomain;
        } else {
            serverDomain = subdomain + "." + process.env.ROOT_HOST;
        }

        return serverDomain;
    },

    getDBOrgDomain: function(customDomain) {

    }
};
