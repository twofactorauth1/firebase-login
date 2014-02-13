var environments = {
    DEVELOPMENT: "development",
    PRODUCTION: "production",
    STAGING: "staging"
};

//---------------------------------------------------------
//  CONFIGURE THESE
//---------------------------------------------------------

process.env.NODE_ENV = environments.DEVELOPMENT;
process.env.PORT = 3000; //remember to change serverURL as well, when changing port!

var serverUrl = "http://localhost:3000";

//---------------------------------------------------------
// EXPORTS
//---------------------------------------------------------
module.exports = {
    environments: environments,
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    view_engine: 'jade', //'ejs'
    view_dir: 'templates', //'views'
    server_url: serverUrl,
    cluster:false,
    freeCpus:2
};
