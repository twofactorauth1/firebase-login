/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../../dao/base.dao.js');
require('../model/devicetype');

var readingTypeDao = require('./valuetype.dao.js');

var dao = {

    options: {
        name:"devicetype.dao",
        defaultModel: $$.m.DeviceType
    },

    createDeviceType: function(id, description, model, manufacturer, readingtypes, callback) {

        if (!readingtypes || readingtypes.length == 0) {
            return callback(new Error("No reading types were provided for new device type " + id));
        }

        var self = this,
            tempReadingTypes = readingtypes.slice();

        function validateReadingType(rt) {
            if (rt) {
                readingTypeDao.getById(rt, function(err, value) {
                    if (err) {
                        return callback(err, null);
                    }
                    if (!value) {
                        return callback(new Error("Reading type " + rt + " not found", null));
                    }
                    return validateReadingType(tempReadingTypes.shift());
                })
            } else {
                var deviceType = new $$.m.DeviceType({
                    _id: id,
                    description: description,
                    model: model,
                    manufacturer: manufacturer,
                    readingtypes: readingtypes
                });

                self.saveOrUpdate(deviceType, function(err, value) {
                    callback(err, value);
                });
            }
        }
        validateReadingType(tempReadingTypes.shift());
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.ReadingTypeDao = dao;

module.exports = dao;
