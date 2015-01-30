/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var socialconfigDao = require('./dao/socialconfig.dao');
var log = $$.g.getLogger("socialconfig_manager");
var twitterDao = require('../dao/social/twitter.dao');

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

    fetchTrackedObject: function(accountId, objIndex, fn) {
        var self = this;
        log.debug('>> fetchTrackedObject');
        self.getSocialConfig(accountId, null, function(err, config){
            if(err) {
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
            } else if (trackedObject.type === 'fb'){
                return fn(null, null);
            } else {
                return fn(null, null);
            }


        });
    },

    _handleTwitterTrackedObject: function(socialAccount, trackedObject, fn) {
        var self = this;
        if(trackedObject.type === 'feed') {
            return twitterDao.getTweetsForId(socialAccount.accessToken, socialAccount.accessTokenSecret, socialAccount.socialId, fn);
        }


    }


};