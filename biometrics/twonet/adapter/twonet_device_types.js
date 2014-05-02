var deviceTypeDao = require('../../platform/dao/devicetype.dao.js');

var twonetDeviceTypes = {

    DT_2NET_BPM: "2net_bpm",
    DT_2NET_SCALE: "2net_scale",
    DT_2NET_PULSEOX: "2net_pulseox",

    init: function() {

        this._deviceTypeIds = [
            this.DT_2NET_BPM,
            this.DT_2NET_SCALE,
            this.DT_2NET_PULSEOX
        ];

        this._deviceTypes = [
            [this.DT_2NET_BPM, "2net blood pressure monitor", "UA-767PBT", "A&D", ["pulse", "systolic", "diastolic"]],
            [this.DT_2NET_SCALE, "2net smart scale", "UC-321PBT", "A&D", ["weight"]],
            [this.DT_2NET_PULSEOX, "2net fancy pulse ox", "9560 Onyx II", "Nonin", ["pulse", "spo2"]]
        ];

        return this;
    },

    isValidDeviceType: function(deviceTypeId) {
        return _.contains(this._deviceTypeIds, deviceTypeId);
    },

    initDB: function(callback) {
        var results = [];
        var localDeviceTypes = this._deviceTypes.slice(0);
        function createDeviceType(dt) {
            if (dt) {
                deviceTypeDao.createDeviceType(dt[0], dt[1], dt[2], dt[3], dt[4], function(err, result) {
                    if (err) {
                        return callback(err, null);
                    }
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

twonetDeviceTypes = _.extend(twonetDeviceTypes).init();
module.exports = twonetDeviceTypes;