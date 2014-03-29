/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

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

$$.dao.ContactActivityDao = dao;

module.exports = dao;
