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
var Post = require('../../models/post');

var OAuth = require('oauth').OAuth;

var twitterAPI = require('node-twitter-api');
var twitterConfig = require('../../configs/twitter.config');
var twitter = new twitterAPI({
    consumerKey: twitterConfig.CLIENT_ID,
    consumerSecret: twitterConfig.CLIENT_SECRET,
    callback: twitterConfig.CALLBACK_URL_LOGIN
});

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
        var self = this;
        self.log.debug('>> getting tweets ', twitterId);
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

        self.log.debug('>> getting tweets params ', params);
        self.log.debug('>> getting tweets url ', url);

        this._makeRequest(url, user, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            var tweets = JSON.parse(value);
            self.log.debug('>> tweets ', tweets);

            if (tweets.length > 0) {
                var result = [];

                var processTweet = function (tweet, cb) {
                    result.push(new Post().convertFromTwitterTweet(tweet));
                    cb();
                };

                async.eachLimit(tweets, 10, processTweet, function (cb) {
                    return fn(null, result);
                });
            } else {
                fn(null, tweets);
            }
        });
    },

    post: function(user, status, fn) {
        var self = this;
        self.log.debug('>> post');

        var accessToken = self._getAccessToken(user);
        var accessTokenSecret = self._getAccessTokenSecret(user);
        twitter.statuses("update", {
                status: status
            },
            accessToken,
            accessTokenSecret,
            function(error, data, response) {
                if (error) {
                    self.log.error('Error updating status: ', error);
                    fn(error, null);
                } else {
                    self.log.debug('data: ', data);
                    self.log.debug('response:', response);
                    self.log.debug('<< post');
                    fn(null, response);
                }
            }
        );
    },


    _getAccessToken: function(user) {
        var self = this;
        self.log.debug('>> _getAccessToken ', user);
        var credentials = user.getCredentials($$.constants.user.credential_types.TWITTER);
        self.log.debug('>> credentials ', credentials);
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
        var self = this;
        self.log.debug('>> _makeRequest ', user);
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
        self.log.debug('>> _makeRequest accessToken ', accessToken);
        var accessTokenSecret = this._getAccessTokenSecret(user);
        self.log.debug('>> _makeRequest accessTokenSecret ', accessTokenSecret);

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

