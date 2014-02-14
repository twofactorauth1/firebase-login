var baseDao = require('./base.dao');

var dao = {

    options: {
        collection: "accounts",
        name: "account.dao",
        model: $$.m.Account,
        storage: "mongo"
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.AccountDao = dao;

module.exports.dao = dao;
