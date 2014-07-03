/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var userDao = require('../dao/user.dao.js');
var accountDao = require('../dao/account.dao.js');
var contactDao = require('../dao/contact.dao.js');
var paymentDao = require('../payments/dao/payment.dao.js');

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

    createTestContact: function (fn) {
        var _c = new $$.m.Contact({
            first: 'Test',
            last: 'Contact',
            birthday: '01/01/1979',
            details: [
                {
                    emails: ['test@example.com']
                }
            ]
        });

        contactDao.saveOrMerge(_c, function(err, value){
            if(err) {
                throw Error("Failed to create test contact: " + err.toString());
            }
            fn(err, value);
        });
    },

    createTestPayment: function(params, fn) {
        var defaultParams = {
            chargeId: 'charge_1',
            amount: 100,
            fingerprint: 'qwertyuiop',
            last4: '0000',
            cvc_check: 'pass',
            created: Date.now(),
            paid: true,
            refunded: false,
            balance_transaction: 'bal_txid_1',
            customerId: 'cust_1',
            contactId: 'contact_1',
            invoiceId: 0,
            capture_date: Date.now()
        };
        var payment = new $$.m.Payment(defaultParams);
        payment.set(params);
        paymentDao.saveOrUpdate(payment, fn);
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