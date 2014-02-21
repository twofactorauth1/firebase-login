var baseDao = require('./base.dao');
requirejs('constants/constants');
require('../models/contact');


var dao = {

    options: {
        name:"contact.dao",
        defaultModel: $$.m.Contact
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ContactDao = dao;

module.exports = dao;
