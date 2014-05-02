var deviceTypeDao = require('../../platform/dao/devicetype.dao.js');

var _DT_2NET_BPM = "2net_bpm";
var _DT_2NET_SCALE = "2net_scale";
var _DT_2NET_PULSEOX = "2net_pulseox";

module.exports = {

    /**
     * Export 2net device types
     */
    DT_2NET_BPM: _DT_2NET_BPM,
    DT_2NET_SCALE: _DT_2NET_SCALE,
    DT_2NET_PULSEOX: _DT_2NET_PULSEOX,

    deviceTypeIds: [
        _DT_2NET_BPM,
        _DT_2NET_SCALE,
        _DT_2NET_PULSEOX
    ],

    deviceTypes: [
        [_DT_2NET_BPM, "2net blood pressure monitor", "UA-767PBT", "A&D", ["pulse", "systolic", "diastolic"]],
        [_DT_2NET_SCALE, "2net smart scale", "UC-321PBT", "A&D", ["weight"]],
        [_DT_2NET_PULSEOX, "2net fancy pulse ox", "9560 Onyx II", "Nonin", ["pulse", "spo2"]]
    ],

    isValidDeviceType: function(deviceTypeId) {
        return _.contains(this.deviceTypeIds, deviceTypeId);
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