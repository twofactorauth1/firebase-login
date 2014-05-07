var runkeeperClient = require('../client/runkeeper_client'),
    subscriptionDao = require('./dao/runkeepersubscription.dao');

module.exports = {

    log: $$.g.getLogger("runkeeper_adapter"),

    getAuthorizationURL: function(contactId) {
        return runkeeperClient.getAuthorizationURL(contactId);
    },

    subscribe: function(contactId, authorizationCode, callback) {

        runkeeperClient.authorizeUser(authorizationCode, function(err, accessToken) {
            if (err) {
                this.log.error("failed to retrieve access token from RunKeeper for contact " + contactId
                    + " and authorizationCode " + authorizationCode);
                this.log.error(err.message);
                return callback(err, null);
            }

            subscriptionDao.createSubscription(contactId, accessToken, function(err, subscription) {
                if (err) {
                    runkeeperClient.deAuthorizeUser(accessToken, function(err, value) {
                        return callback(err, null);
                    })
                } else {
                    this.log.debug("RunKeeper subscription created: " + JSON.stringify(subscription));
                    return callback(null, subscription);
                }
            })
        })
    },

    unsubscribe: function(contactId, callback) {
        subscriptionDao.getById(contactId, function(error, subscription) {
            if (error) {
                this.log.error(error.message);
                return callback(error, null);
            }

            if (!subscription) {
                return callback(new Error("No subscription was found for contact id " + contactId), null);
            }

            runkeeperClient.deAuthorizeUser(subscription.accessToken, function(error, value) {
                if (error) {
                    this.log.error("failed to deauthorize user: " + error.message);
                    return callback(error, null);
                }

                // remove subscription
                subscriptionDao.removeById(subscription._id, function(error, value) {
                    this.log.error("failed to remove subscription " + subscription._id + ": " + error.message);
                    return callback(error, null);
                })
            })

        })
    }
};