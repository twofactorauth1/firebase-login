var appConfig =  require('./app.config');

module.exports = {
    FACEBOOK_CLIENT_ID: '594182237332636',
    FACEBOOK_CLIENT_SECRET: '3edc02755477b84040c4a26075da1e72',
    FACEBOOK_CALLBACK_URL: appConfig.server_url + "/login/facebook/callback"
};

