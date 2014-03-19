var baseDao = require('../base.dao');
var request = require('request');
var crypto = require('crypto');
var twitterConfig = require('../../configs/twitter.config');
var paging = require('../../utils/paging');
var contactDao = require('../contact.dao');
var userDao = require('../user.dao');
var async = require('async');
var querystring = require('querystring');

var Contact = require('../../models/contact');
var OAuth = require('oauth').OAuth;

var dao = {

    options: {
        name:"social.twitter.dao",
        defaultModel:null
    },


    API_URL: "https://api.twitter.com/1.1/",


    checkAccessToken: function(user, fn) {
        var path = "account/verify_credentials.json";
        var url = this._generateUrl(path);

        this._makeRequest(url, user, function(err, value) {
            return fn(err, value);
        });
    },


    getProfileForUser: function(user, fn) {
        var path = "users/show.json";
        var params = {
            user_id:this._getTwitterId(user)
        };

        var url = this._generateUrl(path, params);

        this._makeRequest(url, user, function(err, value) {
            if (err) {
                return fn(err, value);
            }
            var profile = JSON.parse(value);

            var _profile = {
                id: profile.id,
                username: profile.screen_name,
                picture: profile.profile_image_url,
                favoritesCount: profile.favourites_count,
                followersCount: profile.followers_count,
                friendsCount: profile.friends_count,
                name: profile.name,
                first: null,
                middle: null,
                last: null,
                url: profile.url
            };

            var nameParts = $$.u.stringutils.splitFullname(_profile.name);
            _profile.first = nameParts[0];
            _profile.middle = nameParts[1];
            _profile.last = nameParts[2];

            return fn(err, _profile);
        });
    },


    refreshUserFromProfile: function(user, defaultPhoto, fn) {
        if (_.isFunction(defaultPhoto)) {
            fn = defaultPhoto;
            defaultPhoto = false;
        }

        this.getProfileForUser(user, function(err, value) {
            if (!err) {
                user.updateProfileInformation(value.emailAddress, value.first, value.last, null, null, false);

                if (String.isNullOrEmpty(value.picture) === false) {
                    user.addOrUpdatePhoto($$.constants.social.types.TWITTER, value.picture, defaultPhoto);
                }

                user.updateSocialInfo($$.constants.social.types.TWITTER, value.username, value.friendsCount, value.followersCount, value.favoritesCount);

                fn(null, user);
            } else {
                fn(err, value);
            }
        });
    },


    getTweetsForUser: function(user, twitterId, fn) {
        if (_.isFunction(twitterId)) {
            fn = twitterId;
            twitterId = null;
        }

        var path = "statuses/user_timeline.json";
        var params = {
            user_id: twitterId || this._getTwitterId(user),
            count: 200
        };

        var url = this._generateUrl(path, params);

        this._makeRequest(url, user, function(err, value) {
            if (err) {
                return fn(err, value);
            }
            var tweets = JSON.parse(value);
            fn(null, tweets);
        });
    },


    _getAccessToken: function(user) {
        var credentials = user.getCredentials($$.constants.user.credential_types.TWITTER);
        if (credentials == null) {
            return null;
        }
        return credentials.accessToken;
    },


    _getAccessTokenSecret: function(user) {
        var credentials = user.getCredentials($$.constants.user.credential_types.TWITTER);
        if (credentials == null) {
            return null;
        }
        return credentials.accessTokenSecret;
    },


    _getTwitterId: function(user) {
        var credentials = user.getCredentials($$.constants.user.credential_types.TWITTER);
        if (credentials == null) {
            return null;
        }
        return credentials.socialId;
    },


    _generateUrl: function(path, params) {
        var url = this.API_URL + path;

        if (params && _.isString(params) == false && Object.keys(params).length > 0) {
            params = querystring.stringify(params);
        }

        if (_.isObject(params)) {
            params = "";
        }
        if (params != null && params.length > 0 && params.indexOf("?") == -1) {
            url += "?";
        }
        url += params;

        return url;
    },


    _makeRequest: function(url, user, fn) {
        var oauth = new OAuth(
            '',                      //REquest URL (not in use)
            '',                      //Access URL (not in use)
            twitterConfig.CLIENT_ID,
            twitterConfig.CLIENT_SECRET,
            '1.0',
            '',                     //Callback URL, not in use
            'HMAC-SHA1'
        );

        var accessToken = this._getAccessToken(user);
        var accessTokenSecret = this._getAccessTokenSecret(user);

        if (accessToken == null || accessTokenSecret == null) {
            return fn($$.u.errors._401_INVALID_CREDENTIALS, "Cannot make twitter request");
        }

        oauth.get(url, accessToken, accessTokenSecret, function (err, body, response) {
            console.log('URL [%s]', url);
            if (!err && response.statusCode == 200) {
                fn(null, body);
            } else {
                fn(err, response, body);
            }
        });
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.social = $$.dao.social || {};
$$.dao.social.LinkedInDao = dao;

module.exports = dao;

