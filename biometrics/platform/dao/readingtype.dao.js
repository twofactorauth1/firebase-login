/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../../dao/base.dao.js');
require('../model/readingtype');

var dao = {

    options: {
        name:"readingtype.dao",
        defaultModel: $$.m.ReadingType
    },

    createReadingType: function(id, unit, description, fn) {

        var readingType = new $$.m.ReadingType({
            _id: id,
            unit: unit,
            description: description
        });

        this.saveOrUpdate(readingType, function(err, value) {
            fn(err, value);
        });
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.ReadingTypeDao = dao;

module.exports = dao;
