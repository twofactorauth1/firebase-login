var runkeeperClient = require('../client/runkeeper_client'),
    subscriptionDao = require('./dao/runkeepersubscription.dao');

module.exports = {

    log: $$.g.getLogger("runkeeper_adapter"),

    getAuthorizationURL: function(contactId) {
        return runkeeperClient.getAuthorizationURL(contactId);
    },

    subscribe: function(contactId, authorizationCode, callback) {

        var self = this;

        runkeeperClient.authorizeUser(authorizationCode, function(err, accessToken) {
            if (err) {
                self.log.error("failed to retrieve access token from RunKeeper for contact " + contactId
                    + " and authorizationCode " + authorizationCode);
                self.log.error(err.message);
                return callback(err, null);
            }

            self.log.debug("contact " + contactId + " successfully authorized by RunKeeper");

            subscriptionDao.createSubscription(contactId, accessToken, function(err, subscription) {
                if (err) {
                    self.log.error("failed to save subscription: " + err.message);
                    self.log.info("de-authorizing contact " + contactId);

                    runkeeperClient.deAuthorizeUser(accessToken, function(err, value) {
                        if (err) {
                            self.log.error("failed to de-authorize user: " + err.message);
                        }
                        return callback(err, null);
                    })
                } else {
                    self.log.debug("RunKeeper subscription created: " + JSON.stringify(subscription));
                    return callback(null, subscription);
                }
            })
        })
    },

    unsubscribe: function(contactId, callback) {
        var self = this;

        subscriptionDao.getById(contactId, function(error, subscription) {
            if (error) {
                self.log.error(error.message);
                return callback(error, null);
            }

            if (!subscription) {
                return callback(new Error("No subscription was found for contact id " + contactId), null);
            }

            runkeeperClient.deAuthorizeUser(subscription.attributes.accessToken, function(error, value) {
                if (error) {
                    self.log.error("failed to deauthorize user: " + error.message);
                    return callback(error, null);
                }

                // remove subscription
                subscriptionDao.removeById(subscription.attributes._id, function(error, value) {
                    if (error) {
                        self.log.error("failed to remove subscription " + subscription.attributes._id
                            + ": " + error.message);
                    }
                    return callback(error, value);
                })
            })

        })
    }
};