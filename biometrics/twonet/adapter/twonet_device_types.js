var deviceTypeDao = require('../../platform/dao/devicetype.dao.js');

module.exports = {

    deviceTypes: [
        ["2net_bpm", "2net blood pressure monitor", "UA-767PBT", "A&D", ["pulse", "systolic", "diastolic"]],
        ["2net_scale", "2net smart scale", "UC-321PBT", "A&D", ["weight"]],
        ["2net_pulseox", "2net fancy pulse ox", "9560 Onyx II", "Nonin", ["pulse", "spo2"]]
    ],

    getDeviceTypeIds: function() {
        var deviceTypeIds = [];
        for (i = 0; i < this.deviceTypes.length; i++) {
            deviceTypeIds.push(this.deviceTypes[i][0]);
        }
        return deviceTypeIds;
    },

    isValidDeviceType: function(deviceTypeId) {
        return _.contains(this.getDeviceTypeIds(), deviceTypeId);
    },

    initDB: function(callback) {
        var results = [];
        var localDeviceTypes = this.deviceTypes.slice(0);
        function createDeviceType(dt) {
            if (dt) {
                deviceTypeDao.createDeviceType(dt[0], dt[1], dt[2], dt[3], dt[4], function(err, result) {
                    results.push(result);
                    return createDeviceType(localDeviceTypes.shift());
                });
            } else {
                return callback(null, results.length);
            }
        }
        createDeviceType(localDeviceTypes.shift());
    }
};