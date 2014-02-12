var environments = {
    DEVELOPMENT: "development",
    PRODUCTION: "production",
    STAGING: "staging"
};

//---------------------------------------------------------
//  CONFIGURE THESE
//---------------------------------------------------------

process.env.NODE_ENV = environments.DEVELOPMENT;
process.env.PORT = 3001;

var serverUrl = "http://localhost:3001";

//---------------------------------------------------------
// EXPORTS
//---------------------------------------------------------
module.exports = {
    environments: environments,
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    view_engine: 'ejs', //'jade',
    server_url: serverUrl,
    cluster:false,
    freeCpus:2
};
