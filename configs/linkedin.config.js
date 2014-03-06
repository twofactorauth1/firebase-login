var appConfig =  require('./app.config');

var clientId = process.env.LINKEDIN_CLIENT_ID || '77a3p9aub0j6by';
var clientSecret = process.env.LINKEDIN_CLIENT_SECRET || 'B5Akbohq6q9L8a2G';

module.exports = {
    CLIENT_ID: clientId,
    CLIENT_SECRET: clientSecret,
    CALLBACK_URL_LOGIN: appConfig.server_url + "/oauth2/callback",


    getScope: function() {
        return ['r_emailaddress', 'r_basicprofile'];
    },


    getState: function(subdomain) {

    }
};

