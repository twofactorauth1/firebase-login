/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../../../dao/base.dao.js');
require('../model/twonetuser');

var dao = {

    options: {
        name:"twonetuser.dao",
        defaultModel: $$.m.TwonetUser
    },

    createUser: function(twonetUserId, fn) {

        if ($$.u.stringutils.isNullOrEmpty(twonetUserId)) {
            return fn(new Error("A 2net user id was not specified"), null);
        }

        var twonetUser = new $$.m.TwonetUser({
            _id: twonetUserId
        });

        this.saveOrUpdate(twonetUser, function (err, value) {
            fn(err, value);
        })
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.TwonetUserDao = dao;

module.exports = dao;
