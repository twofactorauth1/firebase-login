var request = require('request'),
    runkeeperConfig = require('../../../configs/runkeeper.config');

module.exports = {

    log: $$.g.getLogger("runkeeper_client"),

    getFitnessActivityFeed: function(accessToken, callback) {
        return this._apiCall(
            accessToken,
            "application/vnd.com.runkeeper.FitnessActivityFeed+json",
            "/fitnessActivities",
            callback);
    },

    getAuthorizationURL: function(state) {
        return runkeeperConfig.AUTHORIZATION_URL +
            "?client_id=" + runkeeperConfig.CLIENT_ID +
            "&response_type=code" +
            "&redirect_uri=" + runkeeperConfig.REDIRECT_URL +
            "&state=" + state;
    },

    authorizeUser: function (authorizationCode, callback) {

        var requestDetails = {
            method: "POST",
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            uri: runkeeperConfig.ACCESS_TOKEN_URL,
            body: "grant_type=authorization_code" +
                "&code=" + authorizationCode +
                "&client_id=" + runkeeperConfig.CLIENT_ID +
                "&client_secret=" + runkeeperConfig.CLIENT_SECRET +
                "&redirect_uri=" + runkeeperConfig.REDIRECT_URL
        };

        this.log.debug(requestDetails);

        request(requestDetails, function (error, response, body) {
            callback(error, JSON.parse(body)['access_token']);
        })
    },

    deAuthorizeUser: function (accessToken, callback) {

        var requestDetails = {
            method: "POST",
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            uri: runkeeperConfig.DEAUTHORIZATION_URL,
            body: "access_token=" + accessToken
        };

        this.log.debug(requestDetails);

        request(requestDetails, function (error, response, body) {
            if (error) {
                return callback(error, null);
            }

            if (response.statusCode != 204) {
                return callback(new Error(JSON.stringify(body)), null);
            }

            return callback(null, null);
        })
    },

    _apiCall: function(accessToken, media_type, endpoint, callback) {

        var options = {};

        options.url = runkeeperConfig.API_BASE_URL + endpoint;

        options.headers = {
            'Accept': media_type,
            'Authorization': 'Bearer ' + accessToken
        };

        options.json = {};

        request.get(options, function (error, response, body) {
            this.log.debug("RunKeeper Response status code: " + response.statusCode);
            if (error) {
                callback(error, null);
            } else {
                this.log.debug("RunKeeper Response: " + JSON.stringify(body));
                if (response.statusCode != 200) {
                    return callback(new Error(JSON.stringify(body)), null);
                }

                return callback(null, body);
            }
        })
    }
};



