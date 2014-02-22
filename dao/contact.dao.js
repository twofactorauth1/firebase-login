var baseDao = require('./base.dao');
requirejs('constants/constants');
require('../models/contact');


var dao = {

    options: {
        name:"contact.dao",
        defaultModel: $$.m.Contact
    },


    getContactsShort: function(accountId, letter, fn) {
        //TODO: optimize this so we're not using skip / limit. Instead, we want to cache a
        //      range of all contactIds in the database in redis, for example, and then page
        //      in redis, returning the paged contact Ids, and then querying the db on only
        //      those IDs.


        var nextLetter = String.fromCharCode(letter.charCodeAt() + 1);
        var query = {accountId: accountId, last: { $gte: letter, $lt: nextLetter } };
        var fields = {accountId:1, first:1, last:1, siteActivity:1};

        var obj = {query:query, fields:fields};
        this.findMany(obj, function() {

        });
    }
};

dao = _.extend(dao, baseDao.prototype, dao.options).init();

$$.dao.ContactDao = dao;

module.exports = dao;
