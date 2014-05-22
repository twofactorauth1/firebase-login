require('./dao/device.dao.js');
require('./dao/reading.dao.js');

module.exports = {

    createDevice: function(deviceTypeId, serialNumber, externalId, userId, fn) {
        $$.dao.DeviceDao.createDevice(deviceTypeId, serialNumber, externalId, userId, fn);
    },

    createReading: function(deviceId, contactId, readingTypeId, values, externalId, time, endTime, fn) {
        $$.dao.ReadingDao.createReading(deviceId, contactId, readingTypeId, values, externalId, time, endTime, fn);
    },


    findDevices: function(query, fn) {
        $$.dao.DeviceDao.findMany(query, fn);
    },

    findReadings: function(query, fn) {
        var query = {contactId:query};
        $$.dao.ReadingDao.findMany(query, fn);
    },

    getDeviceById: function(deviceId, fn) {

        $$.dao.DeviceDao.getById(deviceId, function(err, device) {
            if (err) {
                return fn(err, null);
            }

            return fn(null, device);
        });
    },

    assignDevice: function(deviceId, userId, fn) {
        $$.dao.DeviceDao.getById(deviceId, function(err, device){
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
            $$.dao.DeviceDao.saveOrUpdate(device, function (err, value) {
                fn(err, value);
            })
        })
    },

    unassignDevice: function(deviceId, fn) {
        $$.dao.DeviceDao.getById(deviceId, function(err, device){
            if (err) {
                return fn(err, null);
            }

            if (!device) {
                return fn(new Error("No device identified by " + deviceId + " was found in the system"), null);
            }

            device.attributes.userId = null;
            $$.dao.DeviceDao.saveOrUpdate(device, function (err, value) {
                fn(err, value);
            })
        })
    }
};