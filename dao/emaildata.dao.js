var baseDao = require('./base.dao');
requirejs('constants/constants');
var userDao = require('./user.dao');
var contextioDao = require('./integrations/contextio.dao');
var emailServerConfig = require('../configs/emailservers.config');

var dao = {

    options: {
        name:"emaildata.dao",
        defaultModel: null
    },


    removeEmailSource: function(user, id, fn) {
        var emailSource = user.getEmailSource(id);
        if (emailSource == null) {
            process.nextTick(function() {
               fn(null);
            });
            return;
        }

        var fxn = function(err, value) {
            if (!err) {
                user.removeEmailSource(id);
                userDao.saveOrUpdate(user, function(err, value) {
                    if (err) {
                        return fn(err, value);
                    } else {
                        return fn(null);
                    }
                });
            } else {
                fn(err, value);
            }
        };

        switch(emailSource.type) {
            case $$.constants.email_sources.CONTEXTIO:
                contextioDao.removeContextIOAccount(emailSource.providerId, fxn);
                break;
            default:
                return process.nextTick(fn(null));
        }
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ContactDao = dao;

module.exports = dao;
