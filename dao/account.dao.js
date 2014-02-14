var baseDao = require('./base.dao');

var dao = {

    options: {
        name:"account.dao",
        defaultModel: $$.m.Account
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.AccountDao = dao;

module.exports.dao = dao;
