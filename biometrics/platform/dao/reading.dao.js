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

    createReading: function(deviceId, contactId, values, externalId, time, fn) {

        if ($$.u.stringutils.isNullOrEmpty(deviceId)) {
            return fn(new Error("A device id was not specified"), null);
        }

        if ($$.u.stringutils.isNullOrEmpty(contactId)) {
            return fn(new Error("A contact id was not specified"), null);
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
                return fn(new Error("No device with id " + deviceId + " was found in the system"));
            }

            //TODO: validate reading type ids in values against device type

            //TODO: validate contact exists

            var reading = new $$.m.Reading({
                deviceId: deviceId,
                externalId: externalId,
                contactId: contactId,
                time: time,
                values: values
            });

            self.saveOrUpdate(reading, function (err, value) {
                fn(err, value);
            })

        })
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.ReadingDao = dao;

module.exports = dao;
