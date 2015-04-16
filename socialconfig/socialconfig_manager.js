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
var linkedinDao = require('../dao/social/linkedin.dao');
var googleDao = require('../dao/social/google.dao');
var userDao = require('../dao/user.dao');

module.exports = {

    defaultTwitterTrackedObjects : ['feed', 'user', 'mentions', 'numberFollowers', 'profile', 'messages'],
    defaultFacebookTrackedObjects: ['feed', 'pages', 'likes', 'profile', 'messages'],

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
            } if (value === null) {
                log.debug('Creating new socialconfig.');
                var socialConfig = new $$.m.SocialConfig({accountId:accountId});
                return self.createSocialConfig(socialConfig, fn);
            } else {

                //add the tracked objects properly
                _.each(value.get('trackedObjects'), function(obj){
                    if(value.getTrackedAccountById(obj.socialId)) {
                        var trackedAccount = value.getTrackedAccountById(obj.socialId);
                        //make sure the tracked Objects has it
                        trackedAccount.trackedObjects = trackedAccount.trackedObjects || [];
                        if(_.contains(trackedAccount.trackedObjects, obj.type)) {
                            //cool
                        } else {
                            trackedAccount.trackedObjects.push(obj.type);
                        }
                    } else {
                        var socialAccount = value.getSocialAccountById(obj.socialId);
                        if(socialAccount) {
                            socialAccount.trackedObjects = socialAccount.trackedObjects || [];
                            if(_.contains(socialAccount.trackedObjects, obj.type)) {
                                //cool
                            } else {
                                socialAccount.trackedObjects.push(obj.type);
                            }
                            value.get('trackedAccounts').push(socialAccount);
                        }

                    }
                });
                //save it async
                socialconfigDao.saveOrUpdate(value, function(err, value){});
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

    removeSocialAccount: function(accountId, id, socialId, fn) {
        var self = this;
        log.debug('>> removeSocialAccount');

        self.getSocialConfig(accountId, id, function(err, config){
            if(err || config === null) {
                log.error('Error getting social config: ' + err);
                return fn(err, null);
            }
            var socialAccounts = config.get('socialAccounts');
            var parentId = socialId;
            var updatedSocialAccounts = _.filter(socialAccounts, function(_account){
                return _account.id !== socialId;
            });
            config.set('socialAccounts', updatedSocialAccounts);

            var trackedAccounts = config.get('trackedAccounts');
            var removedTrackedAccounts = [];
            var updatedTrackedAccounts = _.filter(trackedAccounts, function(_obj) {
                if(_obj && _obj.parentSocialAccount === parentId) {
                    removedTrackedAccounts.push(_obj.id);
                    return false;
                }
                return true;
            });
            config.set('trackedAccounts', updatedTrackedAccounts);

            var trackedObjects = config.get('trackedObjects');
            var updatedTrackedObjects = _.filter(trackedObjects, function(_obj){
                if(_.contains(removedTrackedAccounts, _obj.socialId)) {
                    return false;
                }
                return true;
                //return _obj.socialId !== socialId || _obj.parentSocialAccount != parentId;
            });
            config.set('trackedObjects', updatedTrackedObjects);

            log.debug('Before call to save, ', config);
            socialconfigDao.saveOrUpdate(config, function(err, value){
                if(err) {
                    log.error('Error updating socialconfig: ' + err);
                    fn(err, null);
                } else {
                    log.debug('<< removeSocialAccount', value);
                    fn(null, value);
                }
            });
        });
    },

    addSocialAccount: function(accountId, socialType, socialId, accessToken, refreshToken, expires, username, profileUrl, scope, accountType, fn) {
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
            creds.accountType = accountType;

            creds.id = $$.u.idutils.generateUUID();
            //add the profile pic
            self._addProfilPicToCreds(creds, function(err, value){
                if(err) {
                    return fn(err, null);
                }
                creds = value;
                var socialAccounts = config.get('socialAccounts');
                var trackedAccounts = config.get('trackedAccounts');
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
                        socialAccounts[index].accountType = creds.accountType;
                        updatedCred = true;
                    }
                });

                trackedAccounts.forEach(function(value, index) {
                    if (value.type == socialType && value.socialId == socialId) {
                        trackedAccounts.splice(index, 1);
                    }
                });
                var trackedAccount = _.extend({toggle: true, parentSocialAccount:creds.id}, creds, {id:$$.u.idutils.generateUniqueAlphaNumeric()});
                trackedAccounts.push(trackedAccount);

                if (updatedCred == false) {
                    socialAccounts.push(creds);
                    /*
                     * Add default tracked objects
                     */
                    var trackedObjects = config.get('trackedObjects');
                    if(creds.type === $$.constants.social.types.FACEBOOK) {
                        _.each(self.defaultFacebookTrackedObjects, function(type){
                            var obj = {
                                socialId: trackedAccount.id,
                                type: type
                            }
                            trackedObjects.push(obj);
                        });
                    } else if(creds.type === $$.constants.social.types.TWITTER) {
                        _.each(self.defaultTwitterTrackedObjects, function(type){
                            var obj = {
                                socialId: trackedAccount.id,
                                type: type
                            }
                            trackedObjects.push(obj);
                        });
                    }
                    config.set('trackedObjects', trackedObjects);
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

                if(creds.accountType === 'adminpage') {
                    return facebookDao.getTokenPageInfo(creds.accessToken, creds.socialId, creds.socialId, function(err, value){
                        if(err) {
                            return fn(err, null);
                        }
                        log.debug('value: ', value);
                        if (value.picture != null && value.picture.data != null) {
                            creds.image = value.picture.data.url;
                        }
                        return fn(null, creds);
                    });
                } else {
                    return facebookDao.getProfile(creds.accessToken, creds.socialId, function(err, value){
                        if(err) {
                            return fn(err, null);
                        }
                        log.debug('value: ', value);
                        if (value.picture != null && value.picture.data != null) {
                            creds.image = value.picture.data.url;
                        }
                        return fn(null, creds);
                    });
                }

            case social.TWITTER:
                return twitterDao.getProfleForId(creds.accessToken, creds.accessTokenSecret, creds.socialId, function(err, value){
                    if(err) {
                        return fn(err, null);
                    }
                    if(value.profile_image_url_https) {
                        creds.image = value.profile_image_url_https;
                    } else {
                        console.dir(value);
                    }
                    return fn(null, creds);
                });

            case social.GOOGLE:
              googleDao.getProfile(creds.socialId, creds.accessToken, function(err, value) {
                if(err) {
                    return fn(err, null);
                }

                if (value.name) {
                  creds.username = value.name;
                }

                if (value.picture) {
                  creds.image = value.picture;
                }

                return fn(null, creds);
              });
            case social.LINKEDIN:
              linkedinDao.getProfile(creds.socialId, creds.accessToken, function(err, value) {
                if (err) {
                  return fn(err, null);
                }

                var nameList = [];
                if (value.firstName) {
                  nameList.push(value.firstName);
                }
                if (value.lastName) {
                  nameList.push(value.lastName);
                }

                if (nameList.length) {
                  creds.username = nameList.join(' ');
                }

                if (value.pictureUrl) {
                  creds.image = value.pictureUrl;
                }

                return fn(null, creds);
              });
            default:
                return process.nextTick(function() {
                    return fn(null, creds);
                });
        }
    },

    fetchTrackedObject: function(accountId, objIndex, since, until, limit, fn) {
        var self = this;
        log.debug('>> fetchTrackedObject ', objIndex);


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

            if(socialAccount && (socialAccount.type === 'tw' || socialAccount.type === 'twitter')) {
                return self._handleTwitterTrackedObject(socialAccount, trackedObject, since, until, limit, fn);
            } else if (socialAccount && (socialAccount.type === 'fb' || socialAccount.type === 'facebook')){
                return self._handleFacebookTrackedObject(socialAccount, trackedObject, since, until, limit, fn);
            } else {
                return fn(null, null);
            }


        });
    },

    getSocialConfigTrackedAccounts: function(accountId, fn) {
        var self = this;
        log.debug('>> getSocialConfigTrackedAccounts');

        var query = {accountId: accountId};

        socialconfigDao.findOne(query, $$.m.SocialConfig, function(err, value){
            if(err) {
                log.error('Error finding socialconfig: ' + err);
                return fn(err, null);
            } if (value === null) {
                log.debug('Creating new socialconfig.');
                var socialConfig = new $$.m.SocialConfig({accountId:accountId});
                self.createSocialConfig(socialConfig, function(err, config){
                    if(err) {
                        log.error('Error creating socialconfig: ' + err);
                        return fn(err, null);
                    }
                    return fn(null, config.get('trackedAccounts'));
                });

            } else {
                log.debug('<< getSocialConfig');
                return fn(null, value.get('trackedAccounts'));
            }
        });
    },

    addTrackedAccount: function(accountId, trackedAccount, fn){
        var self = this;
        log.debug('>> addTrackedAccount');

        self.getSocialConfig(accountId, null, function(err, config){
            if(err) {
                log.error('Error getting socialconfig: ' + err);
                return fn(err, null);
            }
            if(!trackedAccount.parentSocialAccount || !config.getSocialAccountById(trackedAccount.parentSocialAccount)) {
                log.error('Could not match parentSocialAccount [' + trackedAccount.parentSocialAccount + ']');
                return fn('TrackedAccount did not have valid parentSocialAccountField', null);
            }
            //if(!trackedAccount.id) {
                trackedAccount.id = $$.u.idutils.generateUniqueAlphaNumeric();
            //}
            var trackedAccounts = config.get('trackedAccounts') || [];
            trackedAccounts.push(trackedAccount);
            /*
             * Add default tracked objects
             */
            var trackedObjects = config.get('trackedObjects');
            if(trackedAccount.type === $$.constants.social.types.FACEBOOK || trackedAccount.type === 'facebook') {
                _.each(self.defaultFacebookTrackedObjects, function(type){
                    var obj = {
                        socialId: trackedAccount.id,
                        type: type
                    }
                    trackedObjects.push(obj);
                });
            } else if(trackedAccount.type === $$.constants.social.types.TWITTER || trackedAccount.type === 'twitter') {
                _.each(self.defaultTwitterTrackedObjects, function(type){
                    var obj = {
                        socialId: trackedAccount.id,
                        type: type
                    }
                    trackedObjects.push(obj);
                });
            }
            config.set('trackedObjects', trackedObjects);
            config.set('trackedAccounts', trackedAccounts);

            return self.updateSocialConfig(config, fn);
        });

    },

    getTrackedAccount: function(accountId, trackedAccountId, fn) {
        var self = this;
        log.debug('>> getTrackedAccount');

        self.getSocialConfig(accountId, null, function(err, config) {
            if (err) {
                log.error('Error getting socialconfig: ' + err);
                return fn(err, null);
            }

            var trackedAccounts = config.get('trackedAccounts') || [];

            var trackedAccount = _.find(trackedAccounts, function(account){
                return account.id === trackedAccountId;
            });

            return fn(null, trackedAccount);

        });
    },

    updateTrackedAccount: function(accountId, trackedAccount, fn) {
        var self = this;
        log.debug('>> updateTrackedAccount');

        self.getSocialConfig(accountId, null, function(err, config) {
            if (err) {
                log.error('Error getting socialconfig: ' + err);
                return fn(err, null);
            }
            var trackedAccounts = config.get('trackedAccounts') || [];

            var index = 0;
            var updatedTrackedAccount = _.find(trackedAccounts, function(account){
                if(account.id === trackedAccount.id) {
                    return true;
                } else {
                    index++;
                    return false;
                }
            });
            trackedAccounts[index] = trackedAccount;

            config.set('trackedAccounts', trackedAccounts);
            return self.updateSocialConfig(config, fn);

        });
    },

    deleteTrackedAccount: function(accountId, trackedAccountId, fn) {
        var self = this;
        log.debug('>> deleteTrackedAccount ');

        self.getSocialConfig(accountId, null, function(err, config) {
            if (err) {
                log.error('Error getting socialconfig: ' + err);
                return fn(err, null);
            }

            var trackedAccounts = config.get('trackedAccounts') || [];

            var newTrackedAccounts = [];
            _.each(trackedAccounts, function(account){
                if(account.id != trackedAccountId) {
                    newTrackedAccounts.push(account);
                }
            });

            config.set('trackedAccounts', newTrackedAccounts);

            var trackedObjects = config.get('trackedObjects');
            var updatedTrackedObjects = _.filter(trackedObjects, function(_obj){
               return _obj.socialId != trackedAccountId;
            });
            config.set('trackedObjects', updatedTrackedObjects);

            return self.updateSocialConfig(config, fn);
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
            if(socialAccount === null || socialAccount === undefined) {
                log.error('Invalid social account Id');
                return fn('Invalid social accountId', null);
            }

            facebookDao.getTokenAdminPages(socialAccount.accessToken, socialAccount.socialId, null, null, null, fn);
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

    getFacebookProfile: function(accountId, socialAccountId, fn) {
        var self = this;
        log.debug('>> getFacebookProfile');

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
            facebookDao.getProfile(socialAccount.accessToken, socialAccount.socialId, fn);
        });
    },

    shareFacebookLink: function(accountId, socialAccountId, url, picture, name, caption, description, fn) {
        var self = this;
        log.debug('>> getFacebookProfile');

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
            facebookDao.shareLinkWithToken(socialAccount.accessToken, socialAccount.socialId, url, picture, name,
                caption, description, fn);
        });
    },

    shareLinkedinLink: function(accountId, socialAccountId, url, picture, name, caption, description, fn) {
        var self = this;
        log.debug('>> getFacebookProfile');

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
            linkedinDao.shareLinkWithToken(socialAccount.accessToken, socialAccount.socialId, url, picture, name,
                caption, description, fn);
        });
    },

    createFacebookPost: function(accountId, socialAccountId, message, url, fn) {
        var self = this;
        log.debug('>> createFacebookPost');

        self.getSocialConfig(accountId, null, function(err, config) {
            if (err) {
                log.error('Error getting social config: ' + err);
                return fn(err, null);
            }
            var socialAccount = config.getSocialAccountById(socialAccountId);
            if (!socialAccount) {
                log.error('Invalid social account Id');
                return fn('Invalid social accountId', null);
            }
            if(url) {
                facebookDao.savePhoto(socialAccount.accessToken, socialAccount.socialId, url, function(err, value){
                    if(err) {
                        log.error('Error saving photo: ' + err);
                        return fn(err, null);
                    }
                    var objectId = value.id;
                    facebookDao.createPostWithToken(socialAccount.accessToken, socialAccount.socialId, message, objectId, fn);
                });
            } else {
                facebookDao.createPostWithToken(socialAccount.accessToken, socialAccount.socialId, message, null, fn);
            }

        });
    },

    deleteFacebookPost: function(accountId, socialAccountId, postId, fn) {
        var self = this;
        log.debug('>> deleteFacebookPost');

        self.getSocialConfig(accountId, null, function(err, config) {
            if (err) {
                log.error('Error getting social config: ' + err);
                return fn(err, null);
            }
            var socialAccount = config.getSocialAccountById(socialAccountId);
            if (!socialAccount) {
                log.error('Invalid social account Id');
                return fn('Invalid social accountId', null);
            }

            return facebookDao.deletePostWithToken(socialAccount.accessToken, socialAccount.socialId, postId, fn);

        });
    },

    getFacebookPosts: function(accountId, socialAccountId, fn) {
        var self = this;
        log.debug('>> getFacebookPosts');
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

            return facebookDao.getTokenPosts(socialAccount.accessToken, socialAccount.socialId, fn);
        });
    },

    getFacebookStatuses: function(accountId, socialAccountId, fn) {
        var self = this;
        log.debug('>> getFacebookStatuses');
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

            return facebookDao.getTokenStatuses(socialAccount.accessToken, socialAccount.socialId, fn);
        });
    },

    getFacebookTagged: function(accountId, socialAccountId, fn) {
        var self = this;
        log.debug('>> getFacebookTagged');
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

            return facebookDao.getTokenTagged(socialAccount.accessToken, socialAccount.socialId, fn);
        });
    },

    getFacebookPostComments: function(accountId, socialAccountId, postId, fn) {
        var self = this;
        log.debug('>> getFacebookPostComments');
        log.debug('>> accountId ', accountId);
        log.debug('>> socialAccountId ', socialAccountId);
        log.debug('>> postId ', postId);

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

            facebookDao.getPostComments(socialAccount.accessToken, socialAccount.socialId, postId, fn);
        });

    },

    addFacebookComment: function(accountId, socialAccountId, postId, comment, fn) {
        var self = this;
        log.debug('>> addFacebookComment');
        self.getSocialConfig(accountId, null, function(err, config) {
            if (err || config == null) {
                log.error('Error getting social config: ' + err);
                return fn(err, null);
            }
            var socialAccount = config.getSocialAccountById(socialAccountId);
            if (socialAccount === null) {
                log.error('Invalid social account Id');
                return fn('Invalid social accountId', null);
            }
            return facebookDao.postCommentWithToken(socialAccount.accessToken, postId, comment, fn);
        });
    },

    addFacebookLike: function(accountId, socialAccountId, postId, fn) {
        var self = this;
        log.debug('>> addFacebookLike');
        self.getSocialConfig(accountId, null, function(err, config) {
            if (err || config == null) {
                log.error('Error getting social config: ' + err);
                return fn(err, null);
            }
            var socialAccount = config.getSocialAccountById(socialAccountId);
            if (socialAccount === null) {
                log.error('Invalid social account Id');
                return fn('Invalid social accountId', null);
            }
            return facebookDao.postLikeWithToken(socialAccount.accessToken, postId, fn);
        });
    },

    deleteFacebookLike: function(accountId, socialAccountId, postId, fn) {
        var self = this;
        log.debug('>> deleteFacebookLike');
        self.getSocialConfig(accountId, null, function(err, config) {
            if (err || config == null) {
                log.error('Error getting social config: ' + err);
                return fn(err, null);
            }
            var socialAccount = config.getSocialAccountById(socialAccountId);
            if (socialAccount === null) {
                log.error('Invalid social account Id');
                return fn('Invalid social accountId', null);
            }
            return facebookDao.deleteLikeWithToken(socialAccount.accessToken, postId, fn);
        });
    },

    getTwitterFeed: function(accountId, socialAccountId, fn) {
        var self = this;
        log.debug('>> getTwitterFeed');
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

            return twitterDao.getHomeTimelineTweetsForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, null, null, null, fn);
        });
    },

    getTwitterFollowers: function(accountId, socialAccountId, fn) {
        var self = this;
        log.debug('>> getTwitterFollowers');
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

            return twitterDao.getFollowersForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, fn);
        });
    },

    getTwitterProfile: function(accountId, socialAccountId, fn) {
        var self = this;
        log.debug('>> getTwitterProfile');
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

            return twitterDao.getProfleForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, fn);
        });
    },

    createTwitterPost: function(accountId, socialAccountId, post, fn) {
        var self = this;
        log.debug('>> createTwitterPost');
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

            return twitterDao.postWithToken(socialAccount.accessToken, socialAccount.accessTokenSecret, post, fn);
        });
    },

    replyToTwitterPost: function(accountId, socialAccountId, tweetId, post, fn) {
        var self = this;
        log.debug('>> replyToTwitterPost');
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
            return twitterDao.replyToPostWithToken(socialAccount.accessToken, socialAccount.accessTokenSecret, post, tweetId, fn);

        });
    },

    retweetTwitterPost: function(accountId, socialAccountId, tweetId, fn) {
        var self = this;
        log.debug('>> retweetTwitterPost');
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
            return twitterDao.retweetPostWithToken(socialAccount.accessToken, socialAccount.accessTokenSecret, tweetId, fn);
        });
    },

    directMessageTwitterUser: function(accountId, socialAccountId, userId, screenName, msg, fn) {
        var self = this;
        log.debug('>> directMessageTwitterUser');
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

            return twitterDao.directMessageTwitterUserWithToken(socialAccount.accessToken,
                socialAccount.accessTokenSecret, userId, screenName, msg, fn);
        });
    },

    getTwitterDirectMessages: function(accountId, socialAccountId, since, until, limit, fn) {
        var self = this;
        log.debug('>> getTwitterDirectMessages');
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
            return twitterDao.getDirectMessages(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, since, until, limit, fn);
        });
    },

    deleteTwitterPost: function(accountId, socialAccountId, postId, fn) {
        var self = this;
        log.debug('>> createTwitterPost');
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

            return twitterDao.deletePostWithToken(socialAccount.accessToken, socialAccount.accessTokenSecret, postId, fn);
        });
    },

    _handleTwitterTrackedObject: function(socialAccount, trackedObject, since, until, limit, fn) {
        var self = this;
        if(trackedObject.type === 'feed') {
            return twitterDao.getHomeTimelineTweetsForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, since, until, limit, fn);
        } else if(trackedObject.type === 'user') {
            return twitterDao.getUserTimelineTweetsForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, since, until, limit, fn);
        } else if(trackedObject.type === 'mentions') {
            return twitterDao.getMentionsTimelineTweetsForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, since, until, limit, fn);
        } else if(trackedObject.type === 'numberTweets') {
            return twitterDao.getUserTimelineTweetsForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, since, until, limit, fn);
        } else if(trackedObject.type === 'numberFollowers') {
            return twitterDao.getFollowersForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, fn);
        } else if(trackedObject.type === 'profile') {
            return twitterDao.getProfleForId(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, fn);
        } else if(trackedObject.type === 'search') {
            return twitterDao.getSearchResults(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, trackedObject.term, since, until, limit, fn);
        } else if(trackedObject.type === 'messages') {
            return twitterDao.getDirectMessages(socialAccount.accessToken, socialAccount.accessTokenSecret,
                socialAccount.socialId, since, until, limit, fn);
        }


    },

    _handleFacebookTrackedObject: function(socialAccount, trackedObject, since, until, limit, fn) {
        var self = this;
        if(trackedObject.type === 'feed') {
            return facebookDao.getTokenStream(socialAccount.accessToken, socialAccount.socialId, since, until, limit, fn);
        } else if (trackedObject.type === 'pages') {
            return facebookDao.getTokenAdminPages(socialAccount.accessToken, socialAccount.socialId, since, until, limit, fn);
        } else if (trackedObject.type === 'likes') {
            return facebookDao.getLikedPages(socialAccount.accessToken, socialAccount.socialId, since, until, limit, fn);
        } else if (trackedObject.type === 'profile') {
            if(socialAccount.accountType === 'adminpage') {
                return facebookDao.getTokenPageInfo(socialAccount.accessToken, socialAccount.socialId, socialAccount.socialId, fn);
            } else {
                return facebookDao.getProfile(socialAccount.accessToken, socialAccount.socialId, fn);
            }
        } else if (trackedObject.type === 'messages') {
            return facebookDao.getMessages(socialAccount.accessToken, socialAccount.socialId, fn);
        } else if (trackedObject.type === 'search' || trackedObject.type === 'search-user') {
            return facebookDao.getTokenSearch(socialAccount.accessToken, socialAccount.socialId, 'user', trackedObject.term, since, until, limit, fn);
        } else if (trackedObject.type === 'search-page') {
            return facebookDao.getTokenSearch(socialAccount.accessToken, socialAccount.socialId, 'page', trackedObject.term, since, until, limit, fn);
        } else if (trackedObject.type === 'search-event') {
            return facebookDao.getTokenSearch(socialAccount.accessToken, socialAccount.socialId, 'event', trackedObject.term, since, until, limit, fn);
        } else if (trackedObject.type === 'search-group') {
            return facebookDao.getTokenSearch(socialAccount.accessToken, socialAccount.socialId, 'group', trackedObject.term, since, until, limit, fn);
        }
    },

    getGoogleContacts: function(accountId, socialAccountId, user, fn) {
        var self = this;
        log.debug('>> getGoogleContacts');
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
            return googleDao.importContactsForSocialId(accountId, socialAccount.accessToken, socialAccount.socialId, user, [], fn);
        });
    },

    getGoogleContactGroups: function(accountId, socialAccountId, fn) {
        var self = this;
        log.debug('>> getGoogleContactGroups');
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
            return googleDao.getGroupsForAccessToken(socialAccount.accessToken, socialAccount.socialId, fn);
        });
    },

    getLinkedinContacts: function(accountId, socialAccountId, user, fn) {
        var self = this;
        log.debug('>> getLinkedinContacts');
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
            return linkedinDao.importConnectionsAsContactsForSocialId(accountId, socialAccount.accessToken, socialAccount.socialId, user, fn);

        });
    },

    getStripeAccessToken: function(accountId, fn) {
        var self = this;
        self.log.debug('>> getStripeAccessToken');
        self.getSocialConfig(accountId, null, function(err, config) {
            if (err || config == null) {
                log.error('Error getting social config: ' + err);
                return fn(err, null);
            }
            var stripeConfig = config.getSocialAccountsByType('stripe')[0];
            if(!stripeConfig) {
                log.error('No Stripe social account found.');
                return fn('No Stripe social account found.', null);
            }
            return fn(null, stripeConfig.accessToken);

        });
    }


};