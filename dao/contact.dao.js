var baseDao = require('./base.dao');
requirejs('constants/constants');
require('../models/contact');


var dao = {

    options: {
        name:"contact.dao",
        defaultModel: $$.m.Contact
    },


    getContactsShort: function(accountId, letter, fn) {
        var nextLetter = String.fromCharCode(letter.charCodeAt() + 1);
        var query = {accountId: accountId, _last: { $gte: letter, $lt: nextLetter } };
        var fields = {_id:1, accountId:1, first:1, last:1, photo:1, type:1, siteActivity:1};

        var obj = {query:query, fields:fields};
        this.findManyWithFields(query, fields, fn);
    },


    getContactsBySocialIds: function(accountId, socialType, socialIds, fn) {
        var query = { accountId: accountId, "details.type":socialType, "details.socialId": { $in: socialIds} };
        this.findMany(query, fn);
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ContactDao = dao;

module.exports = dao;
