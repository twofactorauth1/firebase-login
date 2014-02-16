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

//---------------------------------------------------------
//
//---------------------------------------------------------
var serverUrl = "http://localhost:" + process.env.PORT;

//Attempt to get from environment, if set
if (typeof(process.env.SERVER_URL) != 'undefined' && process.env.SERVER_URL != null) {
    serverUrl = process.env.SERVER_URL;
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
    freeCpus:2
};
