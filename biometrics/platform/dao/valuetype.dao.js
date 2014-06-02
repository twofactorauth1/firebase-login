/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

require('../../../dao/base.dao.js');
require('../model/valuetype');

var dao = {

    options: {
        name:"valuetype.dao",
        defaultModel: $$.m.ValueType
    },

    createValueType: function(id, unit, description, fn) {

        var valueType = new $$.m.ValueType({
            _id: id,
            unit: unit,
            description: description
        });

        this.saveOrUpdate(valueType, fn);
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.ValueTypeDao = dao;

module.exports = dao;
