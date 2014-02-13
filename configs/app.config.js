var environments = {
    DEVELOPMENT: "development",
    PRODUCTION: "production",
    STAGING: "staging"
};

//---------------------------------------------------------
//  CONFIGURE THESE
//---------------------------------------------------------

process.env.NODE_ENV = environments.PRODUCTION;

var port = 3000;

//---------------------------------------------------------
//
//---------------------------------------------------------
var serverUrl = "";

//We don't want to specifcy a port if we're on MODULUS.IO - needs to be dynamic.
if (process.env.NODE_ENV != environments.PRODUCTION || process.env.PORT == null) {
    process.env.PORT = port; //remember to change serverURL as well, when changing port!
    serverUrl = "http://localhost:" + process.env.PORT;
} else {
    serverUrl = "http://indigenous-10744.onmodulus.net/";
}


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
