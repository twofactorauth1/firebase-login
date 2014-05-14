/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../../dao/base.dao.js');
require('../model/reading');

var deviceTypeDao = require('./devicetype.dao.js');
var readingTypeDao = require('./readingtype.dao.js');
var deviceDao = require('./device.dao.js');

var dao = {

    options: {
        name:"reading.dao",
        defaultModel: $$.m.Reading
    },

    createReading: function(deviceId, contactId, readingTypeId, values, externalId, time, fn) {

        if ($$.u.stringutils.isNullOrEmpty(deviceId)) {
            return fn(new Error("A device id was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(contactId)) {
            return fn(new Error("A contact id was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(readingTypeId)) {
            return fn(new Error("A reading type id was not specified"), null);
        }

        if (time == null) {
            time = Math.floor(new Date().getTime() / 1000);
        }

        var self = this;
        deviceDao.getById(deviceId, function(err, device) {
            if (err) {
                return fn(error, null);
            }

            if (!device) {
                return fn(new Error("No device with id " + deviceId + " was found in the system"), null);
            }

            readingTypeDao.getById(readingTypeId, function (err, readingType) {
                if (err) {
                    return fn(error, null);
                }

                if (!readingType) {
                    return fn(new Error("No reading type with id " + readingTypeId + " was found in the system"), null);
                }

                deviceTypeDao.getById(device.attributes.deviceTypeId, function (err, deviceType) {
                    if (err) {
                        return fn(error, null);
                    }

                    if (!deviceType) {
                        return fn(new Error("Device type " + device.attributes.deviceTypeId + " in device " + deviceId
                            + " does not exist"), null);
                    }

                    if (!_.contains(deviceType.attributes.readingTypes, readingTypeId)) {
                        return fn(new Error("Specified reading type " + readingTypeId
                            + " is not supported in device type " + device.attributes.deviceTypeId));
                    }

                    for (var i=0; i < values.length; i++) {
                        if (!values[i].valueTypeId) {
                            return fn(new Error("No value type id was provided for reading type " + readingTypeId));
                        }

                        if (!_.contains(readingType.attributes.valueTypes, values[i].valueTypeId)) {
                            return fn(new Error("Specified value type " + values[i].valueTypeId
                                + " is not supported in reading type " + readingTypeId));
                        }
                    }

                    //TODO: validate contact exists

                    var reading = new $$.m.Reading({
                        deviceId: deviceId,
                        externalId: externalId,
                        contactId: contactId,
                        readingTypeId: readingTypeId,
                        time: time,
                        values: values
                    });

                    self.saveOrUpdate(reading, fn);
                })
            })
        })
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.ReadingDao = dao;

module.exports = dao;
