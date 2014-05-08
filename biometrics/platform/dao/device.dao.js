/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../../dao/base.dao.js');
require('../model/device');

var deviceTypeDao = require('./devicetype.dao.js');

var dao = {

    options: {
        name:"device.dao",
        defaultModel: $$.m.Device
    },

    createDevice: function(deviceTypeId, serialNumber, externalId, userId, fn) {

        if ($$.u.stringutils.isNullOrEmpty(deviceTypeId)) {
            return fn(new Error("A device type was not specified"), null);
        }

        var self = this;
        deviceTypeDao.getById(deviceTypeId, function(err, value) {
            if (err) {
                return fn(err, null);
            }

            if (!value) {
                return fn(new Error("Device type " + deviceTypeId + " not found"), null);
            }

            var device = new $$.m.Device({
                serialNumber: serialNumber,
                externalId: externalId,
                deviceTypeId: deviceTypeId,
                userId: userId
            });

            self.saveOrUpdate(device, function (err, value) {
                fn(err, value);
            })
        })
    }
};

dao = _.extend(dao, $$.dao.BaseDao.prototype, dao.options).init();

$$.dao.DeviceDao = dao;

module.exports = dao;
