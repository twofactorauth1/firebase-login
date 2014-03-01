var environments = {
    DEVELOPMENT: "development",
    PRODUCTION: "production",
    STAGING: "staging"
};

//---------------------------------------------------------
//  CONFIGURE THESE
//---------------------------------------------------------

if (process.env.NODE_ENV == null) {
    process.env.NODE_ENV = environments.DEVELOPMENT;
}

if (process.env.PORT == null) {
    process.env.PORT = 3000;
}

/**
 * For local:  indigenous.local, localhost, etc.  -- modify hosts file to point 127.0.0.1 to app.indigenous.io
 * For production: indigenous.io
 */
if (process.env.ROOT_HOST == null) {
    process.env.ROOT_HOST = "indigenous.local";
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

if (process.env.PORT && process.env.PORT != 80 && process.env.PORT != 443 && process.env.PORT != 8080) {
    serverUrl += ":" + process.env.PORT;
}


//---------------------------------------------------------
// EXPORTS
//---------------------------------------------------------
module.exports = {
    environments: environments,
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    view_engine: 'jade',
    view_dir: 'templates',
    server_url: serverUrl,
    support_email: "support@indigenous.com",
    cluster:false,
    freeCpus:2,

    getServerUrl: function(subdomain) {
        if (subdomain == null) {
            subdomain = "app";
        }


        var serverUrl = (process.env.IS_SECURE == "true" || process.env.IS_SECURE == true) ? "https://" : "http://";
        serverUrl += subdomain + "." + process.env.ROOT_HOST;

        if (process.env.PORT && process.env.PORT != 80 && process.env.PORT != 443 && process.env.PORT != 8080) {
            serverUrl += ":" + process.env.PORT;
        }
        return serverUrl;
    }
};
