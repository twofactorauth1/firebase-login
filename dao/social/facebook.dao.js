var baseDao = require('../base.dao');
var request = require('request');
var crypto = require('crypto');
var facebookConfig = require('../../configs/facebook.config');

var dao = {

    options: {
        name:"social.facebook.dao",
        defaultModel:null
    },


    GRAPH_API_URL: "https://graph.facebook.com/",


    getAppSecretProof: function(accessToken) {
        var proof = crypto.createHmac('sha256', facebookConfig.CLIENT_SECRET).update(accessToken).digest('hex');
        return "app_secret=" + proof;
    },


    generateUrl: function(path, accessToken) {
        var url = this.GRAPH_API_URL + path;
        if (url.indexOf("?") > -1) {
            url += "&";
        } else {
            url += "?";
        }

        url += "access_token=" + accessToken;
        return url;
    },


    getProfileForUser: function(user, fn) {
        var credentials = user.getCredentials($$.constants.user.credential_types.FACEBOOK);
        if (credentials == null) {
            return fn("No Credentials Found", "No Facebook credentials found");
        }

        return this.getProfile(credentials.socialId, credentials.accessToken, fn);
    },


    getProfile: function(profileId, accessToken, fn) {
        var fields = "email,picture,first_name,last_name,middle_name,name,username";

        var path = profileId + "?fields=" + fields;
        var url = this.generateUrl(path, accessToken);

        request(url, function(err, resp, body) {
            if (!err) {
                var profile = JSON.parse(body);
                fn(null, profile);
            } else {
                fn(err, resp);
            }
        });
    },


    refreshUserFromProfile: function(user, defaultPhoto, fn) {
        if (_.isFunction(defaultPhoto)) {
            fn = defaultPhoto;
            defaultPhoto = false;
        }

        this.getProfileForUser(user, function(err, value) {
            if (!err) {
                var obj = {
                    first:value.first_name,
                    last:value.last_name,
                    middle:value.middle_name
                };

                user.set(obj);

                if (value.picture != null && value.picture.data != null) {
                    user.addOrUpdatePhoto($$.constants.social.types.FACEBOOK, value.picture.data.url, defaultPhoto);
                }

                fn(null, user);
            } else {
                fn(err, value);
            }
        });
    },


    getFriends: function(profileId, accessToken) {

    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.social = $$.dao.social || {};
$$.dao.social.ContactDao = dao;

module.exports = dao;

