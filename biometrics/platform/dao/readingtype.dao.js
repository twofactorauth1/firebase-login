/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../../dao/base.dao.js');
require('../model/readingtype');

var valueTypeDao = require('./valuetype.dao');

var dao = {

    options: {
        name:"readingtype.dao",
        defaultModel: $$.m.ReadingType
    },

    createReadingType: function(id, description, valueTypes, fn) {

        if (!valueTypes || valueTypes.length == 0) {
            return callback(new Error("No value types were provided for new reading type " + id));
        }

        var self = this,
            tempValueTypes = valueTypes.slice();

        function validateValueType(vt) {
            if (vt) {
                valueTypeDao.getById(vt, function(err, value) {
                    if (err) {
                        return callback(err, null);
                    }
                    if (!value) {
                        return callback(new Error("Value type " + vt + " not found", null));
                    }
                    return validateValueType(tempValueTypes.shift());
                })
            } else {
                var readingType = new $$.m.ReadingType({
                    _id: id,
                    description: description,
                    valueTypes: valueTypes
                });

                self.saveOrUpdate(readingType, fn);
            }
        }
        validateValueType(tempValueTypes.shift());
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.ReadingTypeDao = dao;

module.exports = dao;
