var userDao = require('../dao/user.dao.js');
var accountDao = require('../dao/account.dao.js');

module.exports = {

    createTestUser: function(fn) {
        userDao.createUserFromUsernamePassword("__test_user_" + $$.u.idutils.generateUniqueAlphaNumeric(), "password", "testuser@indigenous.io", fn);
    },

    destroyTestUser: function(user, fn) {
        var accountIds = user.getAllAccountIds();

        if (accountIds.length > 0) {
            accountIds.forEach(function(id) {
                accountDao.removeById(id, function() { });
            });
        }
        userDao.remove(user, fn);
    },

    closeDBConnections: function() {
        if ($$.g.mongos != null) {
            $$.g.mongos.forEach(function(mongo) {
                mongo.db.close();
            });
        }
    },

    shutDown: function() {
        this.closeDBConnections();
        if (servers != null) {
            servers.forEach(function(server) {
                console.log("Closing severs");
                server.close();
            })
        }
        process.exit(1);
    }
};