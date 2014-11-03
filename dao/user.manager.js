/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */


var dao = require('./user.dao');
var accountDao = require('./account.dao');
var cmsDao = require('../cms/dao/cms.dao');
var log = $$.g.getLogger("user.manager");
var securityManager = require('../security/sm');

module.exports = {

    createAccountAndUser: function(username, password, email, accountToken, fn) {
        var self = this;
        if (_.isFunction(accountToken)) {
            fn = accountToken;
            accountToken = null;
        }
        log.debug('>> createAccountAndUser');
        dao.getUserByUsername(username, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            if (value != null) {
                return fn(true, "An account with this username already exists");
            }

            var deferred = $.Deferred();


            accountDao.convertTempAccount(accountToken, function(err, value) {
                if (!err) {
                    deferred.resolve(value);
                } else {
                    deferred.reject();
                    return fn(err, value);
                }
            });

            deferred
                .done(function(account) {
                    var accountId;
                    if (account != null) {
                        accountId = account.id();
                    }

                    if (accountId == null) {
                        return fn(true, "Failed to create user, no account found");
                    }
                    var userId = $$.u.idutils.generateUUID();
                    var user = new $$.m.User({
                        _id: userId,
                        username:username,
                        email:email,
                        created: {
                            date: new Date().getTime(),
                            strategy: $$.constants.user.credential_types.LOCAL,
                            by: userId, //self-created
                            isNew: true
                        }
                    });


                    user.createOrUpdateLocalCredentials(password);
                    var roleAry = ["super","admin","member"];
                    user.createUserAccount(accountId, username, password, roleAry);

                    log.debug('Initializing user security.');
                    securityManager.initializeUserPrivileges(user.id(), username, roleAry, accountId, function(err, value){
                        if(err) {
                            log.error('Error initializing user privileges for userID: ' + user.id());
                            return fn(err, null);
                        }
                        log.debug('creating website for account');
                        cmsDao.createWebsiteForAccount(accountId, 'admin', function(err, value){
                            if(err) {
                                log.error('Error creating website for account: ' + err);
                                fn(err, null);
                            } else {
                                log.debug('creating default page');
                                cmsDao.createDefaultPageForAccount(accountId, value.id(), function(err, value){
                                    if(err) {
                                        log.error('Error creating default page for account: ' + err);
                                        fn(err, null);
                                    } else {
                                        log.debug('saving user.');
                                        dao.saveOrUpdate(user, function(err, savedUser){
                                            if(err) {
                                                log.error('Error saving user: ' + err);
                                                fn(err, null);
                                            } else {
                                                log.debug('<< createUserFromUsernamePassword');
                                                fn(null, savedUser);
                                            }
                                        });
                                    }

                                });
                            }

                        });
                    });

                });
        });
    }

};