var deviceDao = require('./dao/device.dao.js');
var readingDao = require('./dao/reading.dao.js');

module.exports = {

    createDevice: function(deviceTypeId, serialNumber, externalId, userId, fn) {
        deviceDao.createDevice(deviceTypeId, serialNumber, externalId, userId, fn);
    },

    createReading: function(deviceId, contactId, values, externalId, time, fn) {
        readingDao.createReading(deviceId, contactId, values, externalId, time, fn);
    },

    findDevices: function(query, fn) {
        deviceDao.findMany(query, fn);
    },

    findReadings: function(query, fn) {
        readingDao.findMany(query, fn);
    },

    getDeviceById: function(deviceId, fn) {

        deviceDao.getById(deviceId, function(err, device) {
            if (err) {
                return fn(err, null);
            }

            return fn(null, device);
        });
    },

    assignDevice: function(deviceId, userId, fn) {
        deviceDao.getById(deviceId, function(err, device){
            if (err) {
                return fn(err, null);
            }

            if (!device) {
                return fn(new Error("No device identified by " + deviceId + " was found in the system"), null);
            }

            if (!$$.u.stringutils.isNullOrEmpty(device.attributes.userId)) {
                if (device.attributes.userId == userId) {
                    //already assigned to that user
                    return fn(null, device);
                }
                return fn(new Error("Device is already assigned to a different user"), null);
            }

            device.attributes.userId = userId;
            deviceDao.saveOrUpdate(device, function (err, value) {
                fn(err, value);
            })
        })
    },

    unassignDevice: function(deviceId, fn) {
        deviceDao.getById(deviceId, function(err, device){
            if (err) {
                return fn(err, null);
            }

            if (!device) {
                return fn(new Error("No device identified by " + deviceId + " was found in the system"), null);
            }

            device.attributes.userId = null;
            deviceDao.saveOrUpdate(device, function (err, value) {
                fn(err, value);
            })
        })
    }
};