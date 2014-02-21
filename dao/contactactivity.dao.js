var baseDao = require('./base.dao');
requirejs('constants/constants');
require('../models/contactactivity');


var dao = {

    options: {
        name:"contactactivity.dao",
        defaultModel: $$.m.ContactActivity
    },


    getByContactId: function(contactId, fn) {
        var query = {contactId:contactId};
        this.findMany(query, fn);
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ContactDao = dao;

module.exports = dao;
