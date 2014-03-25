/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

var userDao = require('../dao/user.dao.js');
var accountDao = require('../dao/account.dao.js');

module.exports = {

    createTestUser: function (testClass, fn) {
        if (_.isFunction(testClass)) {
            fn = testClass;
            testClass = null;
        }
        userDao.createUserFromUsernamePassword("__test_user_" + $$.u.idutils.generateUniqueAlphaNumeric(), "password", "testuser@indigenous.io", function (err, value) {
            if (err) {
                throw Error("Failed to create test user: " + err.toString());
            }

            if (testClass) {
                testClass.user = value;

                var accountIds = value.getAllAccountIds();
                testClass.accountId = accountIds[0];
                testClass.userId = value.id();
            }

            fn(null, value);
        });
    },

    destroyTestUser: function (user, fn) {
        var accountIds = user.getAllAccountIds();

        if (accountIds.length > 0) {
            accountIds.forEach(function (id) {
                accountDao.removeById(id, function () {
                });
            });
        }

        userDao.remove(user, function(err, value) {
            if (err) {
                throw Error("Failed to destroy test User: " + err.toString());
            }

            fn(err, value);
        });
    },

    closeDBConnections: function () {
        if ($$.g.mongos != null) {
            $$.g.mongos.forEach(function (mongo) {
                mongo.db.close();
            });
        }
    },

    shutDown: function () {
        return;

        //This was only required when running from webstorm. When run from grunt or cmd line, it works
        //and we don't need to close all the connections and shut down the server manually.
        this.closeDBConnections();
        if (servers != null) {
            var async = require('async');

            async.eachSeries(servers, function (server, cb) {
                console.log("Closing server after tests");
                server.close();
                cb();

            }, function () {
                setTimeout(function () {
                    process.exit(1);
                }, 1000);
            });
        }
    }
};