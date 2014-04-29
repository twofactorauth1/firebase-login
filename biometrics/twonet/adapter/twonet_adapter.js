var twonetClient = require('../client/index');
var twonetUserDao = require('./dao/twonetuser.dao.js');

module.exports = {

    registerUser: function(platformUserId, fn) {
        /**
         * Validate user hasn't been signed up already
         */
        twonetUserDao.getById(platformUserId, function(err, user) {
            if (err) {
                return fn(err, null);
            }

            if (user) {
                return fn(new Error("User " + platformUserId + " already exists"), null);
            }

            /**
             * Sign up the user. In the 2net world, we tell 2net what user id we want, so we'll just use our
             * Indigenous platform user id as the id.
             */
            twonetClient.userRegistration.register(platformUserId, function (err, response) {
                if (err) {
                    throw err;
                }

                console.log("succesfully registered guid: " + response);

                /**
                 * Persist registration record in the database
                 */
                twonetUserDao.createUser(platformUserId, function (createUserError, createUserResponse) {
                    if (createUserError) {
                        console.log("failed to persist twonet user");
                        console.error(createUserError);

                        // rollback registration
                        twonetClient.userRegistration.unregister(platformUserId, function (err, response) {
                            return fn(createUserError, null);
                        })
                    } else {
                        return fn(null, createUserResponse);
                    }
                })
            })
        })
    },

    unregisterUser: function(platformUserId, fn) {

        twonetClient.userRegistration.unregister(platformUserId, function (err, response) {
            if (err) {
                console.error(err);
                return fn(err, null);
            }

            console.log("succesfully unregistered guid: " + response);

            /**
             * Delete record
             */
            twonetUserDao.removeById(platformUserId, function(err, res) {
                if (err) {
                    console.error(err);
                    return fn(err, null);
                }

                return fn(null, response);
            })
        })
    }
};