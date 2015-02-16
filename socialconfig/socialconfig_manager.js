/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var socialconfigDao = require('./dao/socialconfig.dao');
var log = $$.g.getLogger("socialconfig_manager");
var twitterDao = require('../dao/social/twitter.dao');
var facebookDao = require('../dao/social/facebook.dao');

module.exports = {

    createSocialConfig: function(socialConfig, fn) {
        var self = this;
        log.debug('>> createSocialConfig');
        //make sure we have the object and not just json
        if(typeof socialConfig.id !== 'function') {
            socialConfig = new $$.m.SocialConfig(socialConfig);
        }

        socialconfigDao.saveOrUpdate(socialConfig, function(err, value){
            if(err) {
                log.error('Error creating socialconfig: ' + err);
                fn(err, null);
            } else {
                log.debug('<< createSocialConfig');
                fn(null, value);
            }
        });
    },

    createSocialConfigFromUser: function(accountId, user, fn) {
        var self = this;
        log.debug('>> createSocialConfigFromUser');
        var socialConfig = new $$.m.SocialConfig({accountId:accountId});
        var creds = user.get('credentials');
        var socialAccounts = socialConfig.get('socialAccounts') || [];
        _.each(creds, function(cred){
            if(cred.type !== 'lo') {
                cred.id = $$.u.idutils.generateUUID();
                socialAccounts.push(cred);
            }
        });
        socialConfig.set('socialAccounts', socialAccounts);

        socialconfigDao.saveOrUpdate(socialConfig, function(err, value){
            if(err) {
                log.error('Error creating socialconfig: ' + err);
                fn(err, null);
            } else {
                log.debug('<< createSocialConfigFromUser');
                fn(null, value);
            }
        });
    },

    getSocialConfig: function(accountId, configId, fn) {
        var self = this;
        log.debug('>> getSocialConfig');
        var query = {accountId: accountId};
        if(configId) {
            query._id= configId;
        }
        socialconfigDao.findOne(query, $$.m.SocialConfig, function(err, value){
            if(err) {
                log.error('Error finding socialconfig: ' + err);
                return fn(err, null);
            } else {
                log.debug('<< getSocialConfig');
                return fn(null, value);
            }
        });
    },

    updateSocialConfig: function(socialConfig, fn) {
        var self = this;
        log.debug('>> updateSocialConfig');
        //make sure we have the object and not just json
        if(typeof socialConfig.id !== 'function') {
            socialConfig = new $$.m.SocialConfig(socialConfig);
        }

        if(socialConfig.id() === null) {
            var query = {accountId: socialConfig.get('accountId')};
            socialconfigDao.findOne(query, $$.m.SocialConfig, function(err, value){
                if(err) {
                    log.error('Error finding socialconfig: ' + err);
                    return fn(err, null);
                } else {
                    socialConfig.set('_id', value.id());
                    socialconfigDao.saveOrUpdate(socialConfig, function(err, value){
                        if(err) {
                            log.error('Error updating socialconfig: ' + err);
                            fn(err, null);
                        } else {
                            log.debug('<< updateSocialConfig');
                            fn(null, value);
                        }
                    });
                }
            });
        } else {
            socialconfigDao.saveOrUpdate(socialConfig, function(err, value){
                if(err) {
                    log.error('Error updating socialconfig: ' + err);
                    fn(err, null);
                } else {
                    log.debug('<< updateSocialConfig');
                    fn(null, value);
                }
            });
        }
    },

    addSocialAccount: function(accountId, socialType, socialId, accessToken, refreshToken, expires, username, profileUrl, scope, fn) {
        var self = this;
        log.debug('>> addSocialAccount');

        self.getSocialConfig(accountId, null, function(err, config){
            if(err) {
                log.error('Error getting social config: ' + err);
                return fn(err, null);
            }
            var creds = {};
            creds.type = socialType;
            creds.socialId = socialId;
            creds.accessToken = accessToken;
            if (socialType == $$.constants.social.types.TWITTER) {
                creds.accessTokenSecret = refreshToken;
            } else {
                creds.refreshToken = refreshToken;
            }
            if (expires != null && expires > 0) {
                creds.expires = new Date().getTime() + (expires*1000);
            }
            creds.username = username;
            creds.socialUrl = profileUrl;
            creds.scope = scope;

            creds.id = $$.u.idutils.generateUUID();
            //add the profile pic
            self._addProfilPicToCreds(creds, function(err, value){
                if(err) {
                    return fn(err, null);
                }
                creds = value;
                var socialAccounts = config.get('socialAccounts');

                var updatedCred = false;
                socialAccounts.forEach(function(value, index) {
                    if (value.type == socialType && value.socialId == socialId) {
                        socialAccounts[index].accessToken = creds.accessToken;
                        if (creds.accessTokenSecret) {
                            socialAccounts[index].accessTokenSecret = creds.accessTokenSecret;
                        }

                        if (creds.refreshToken) {
                            socialAccounts[index].refreshToken = creds.refreshToken;
                        }

                        if (creds.expires) {
                            socialAccounts[index].expires = creds.expires;
                        }

                        socialAccounts[index].username = creds.username;
                        socialAccounts[index].socialUrl = creds.socialUrl;
                        socialAccounts[index].scope = creds.scope;
                        updatedCred = true;
                    }
                });
                if (updatedCred == false) {
                    socialAccounts.push(creds);
                }
                config.set('socialAccounts', socialAccounts);
                socialconfigDao.saveOrUpdate(config, function(err, value){
                    if(err) {
                        log.error('Error saving social config: ' + err);
                        return fn(err, null);
                    } else {
                        log.debug('<< addSocialAccount');
                        return fn(null, value);
                    }

                });
            });


        });

    },

    _addProfilPicToCreds: function(creds, fn) {
        var self = this;
        var social = $$.constants.social.types;
        switch(creds.type) {
            case social.FACEBOOK:
                facebookDao.getProfile(creds.accessToken, creds.socialId, function(err, value){
                    if(err) {
                        return fn(err, null);
                    }
                    if (value.picture != null && value.picture.data != null) {
                        creds.image = value.picture.data.url;
                    }
                    return fn(null, creds);
                });
            case social.TWITTER:
                return fn(null, creds);
            case social.GOOGLE:
                return fn(null, creds);
            case social.LINKEDIN:
                return fn(null, creds);
            default:
                return process.nextTick(function() {
                    return fn(null, creds);
                });
        }
    },

    fetchTrackedObject: function(accountId, objIndex, fn) {
        var self = this;
        log.debug('>> fetchTrackedObject');
        self.getSocialConfig(accountId, null, function(err, config){
            if(err || config === null) {
                log.error('Error getting social config: ' + err);
                return fn(err, null);
            }
            if(objIndex >= config.get('trackedObjects').length) {
                log.error('Invalid index: ' + objIndex + ' is greater than number of tracked objects: ' + config.get('trackedObjects').length);
                return fn('Invalid index', null);
            }
            var trackedObject = config.get('trackedObjects')[objIndex];
            var socialAccount = config.getSocialAccountById(trackedObject.socialId);
            if(socialAccount.type === 'tw') {
                return self._handleTwitterTrackedObject(socialAccount, trackedObject, fn);
            } else if (socialAccount.type === 'fb'){
                return self._handleFacebookTrackedObject(socialAccount, trackedObject, fn);
            } else {
                return fn(null, null);
            }


        });
    },

    getFacebookPages: function(accountId, socialAccountId, fn) {
        var self = this;
        log.debug('>> getFacebookPages');
        self.getSocialConfig(accountId, null, function(err, config) {
            if (err) {
                log.error('Error getting social config: ' + err);
                return fn(err, null);
            }
            var socialAccount = config.getSocialAccountById(socialAccountId);
            if(socialAccount === null) {
                log.error('Invalid social account Id');
                return fn('Invalid social accountId', null);
            }

            facebookDao.getTokenAdminPages(socialAccount.accessToken, socialAccount.socialId, fn);
        });
    },

    getFacebookPageInfo: function(accountId, socialAccountId, pageId, fn) {
        var self = this;
        log.debug('>> getFacebookPageInfo');

        self.getSocialConfig(accountId, null, function(err, config) {
            if (err) {
                log.error('Error getting social config: ' + err);
                return fn(err, null);
            }
            var socialAccount = config.getSocialAccountById(socialAccountId);
            if (socialAccount === null) {
                log.error('Invalid social account Id');
                return fn('Invalid social accountId', null);
            }

            facebookDao.getTokenPageInfo(socialAccount.accessToken, socialAccount.socialId, pageId, fn);
        });

    },

    createFacebookPost: function(accountId, socialAccountId, message,fn) {
        var self = this;
        log.debug('>> createFacebookPost');

        self.getSocialConfig(accountId, null, function(err, config) {
            if (err) {
                log.error('Error getting social config: ' + err);
                return fn(err, null);
            }
            var socialAccount = config.getSocialAccountById(socialAccountId);
            if (socialAccount === null) {
                log.error('Invalid social account Id');
                return fn('Invalid social accountId', null);
            }

            facebookDao.createPostWithToken(socialAccount.accessToken, socialAccount.socialId, message, fn);

        });
    },

    _handleTwitterTrackedObject: function(socialAccount, trackedObject, fn) {
        var self = this;
        if(trackedObject.type === 'feed') {
            return twitterDao.getHomeTimelineTweetsForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, fn);
        } else if(trackedObject.type === 'user') {
            return twitterDao.getUserTimelineTweetsForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, fn);
        } else if(trackedObject.type === 'mentions') {
            return twitterDao.getMentionsTimelineTweetsForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, fn);
        } else if(trackedObject.type === 'numberTweets') {
            return twitterDao.getUserTimelineTweetsForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, fn);
        } else if(trackedObject.type === 'numberFollowers') {
            return twitterDao.getFollowersForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, fn);
        } else if(trackedObject.type === 'profile') {
            return twitterDao.getProfleForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, fn);
        } else if(trackedObject.type === 'search') {
            return twitterDao.getSearchResults(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, trackedObject.term, fn);
        } else if(trackedObject.type === 'messages') {
            return twitterDao.getDirectMessages(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, fn);
        }


    },

    _handleFacebookTrackedObject: function(socialAccount, trackedObject, fn) {
        var self = this;
        if(trackedObject.type === 'feed') {
            return facebookDao.getTokenStream(socialAccount.accessToken, socialAccount.socialId, fn);
        } else if (trackedObject.type === 'pages') {
            return facebookDao.getTokenAdminPages(socialAccount.accessToken, socialAccount.socialId, fn);
        } else if (trackedObject.type === 'likes') {
            return facebookDao.getLikedPages(socialAccount.accessToken, socialAccount.socialId, fn);
        } else if (trackedObject.type === 'profile') {
            return facebookDao.getProfile(socialAccount.accessToken, socialAccount.socialId, fn);
        } else if (trackedObject.type === 'messages') {
            return facebookDao.getMessages(socialAccount.accessToken, socialAccount.socialId, fn);
        } else if (trackedObject.type === 'search' || trackedObject.type === 'search-user') {
            return facebookDao.getTokenSearch(socialAccount.accessToken, socialAccount.socialId, 'user', trackedObject.term, fn);
        } else if (trackedObject.type === 'search-page') {
            return facebookDao.getTokenSearch(socialAccount.accessToken, socialAccount.socialId, 'page', trackedObject.term, fn);
        } else if (trackedObject.type === 'search-event') {
            return facebookDao.getTokenSearch(socialAccount.accessToken, socialAccount.socialId, 'event', trackedObject.term, fn);
        } else if (trackedObject.type === 'search-group') {
            return facebookDao.getTokenSearch(socialAccount.accessToken, socialAccount.socialId, 'group', trackedObject.term, fn);
        }
    }


};
