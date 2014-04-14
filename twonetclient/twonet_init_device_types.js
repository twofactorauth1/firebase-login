var deviceTypeDao = require('../dao/devicetype.dao.js');

module.exports = {

    initialize: function(callback) {

        var deviceTypes = [
            ["2net_bpm", "2net blood pressure monitor", "UA-767PBT", "A&D", ["pulse", "systolic", "diastolic"]],
            ["2net_scale", "2net smart scale", "UC-321PBT", "A&D", ["weight"]],
            ["2net_pulseox", "2net fancy pulse ox", "9560 Onyx II", "Nonin", ["pulse", "spo2"]]
        ];

        var results = [];
        function createDeviceType(dt) {
            if (dt) {
                deviceTypeDao.createDeviceType(dt[0], dt[1], dt[2], dt[3], dt[4], function(err, result) {
                    results.push(result);
                    return createDeviceType(deviceTypes.shift());
                });
            } else {
                return callback(null, results.length);
            }
        }
        createDeviceType(deviceTypes.shift());
    }
};