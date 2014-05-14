require('../../platform/dao/devicetype.dao');
require('../../platform/dao/readingtype.dao');

var ValueTypes = require('../../platform/bio_value_types');

var twonetDeviceTypes = {

    /**
     * Reading types
     */
    RT_2NET_BP: "2net_bp",
    RT_2NET_WEIGHT: "2net_weight",
    RT_2NET_PULSEOX: "2net_pulseox",

    DT_2NET_BPM: "2net_bpm",
    DT_2NET_SCALE: "2net_scale",
    DT_2NET_PULSEOX: "2net_pulseox",

    init: function() {

        this._readingTypesIds = [
            this.RT_2NET_BP,
            this.RT_2NET_WEIGHT,
            this.RT_2NET_PULSEOX
        ];

        this._readingTypes = [
            [this.RT_2NET_BP, "2net blood pressure reading", [ValueTypes.VT_PULSE, ValueTypes.VT_SYSTOLIC, ValueTypes.VT_DIASTOLIC]],
            [this.RT_2NET_WEIGHT, "2net weight reading", [ValueTypes.VT_POUNDS]],
            [this.RT_2NET_PULSEOX, "2net pulse ox reading", [ValueTypes.VT_PULSE, ValueTypes.VT_SP02]]
        ];

        this._deviceTypeIds = [
            this.DT_2NET_BPM,
            this.DT_2NET_SCALE,
            this.DT_2NET_PULSEOX
        ];

        this._deviceTypes = [
            [this.DT_2NET_BPM, "2net blood pressure monitor", "UA-767PBT", "A&D", [this.RT_2NET_BP]],
            [this.DT_2NET_SCALE, "2net smart scale", "UC-321PBT", "A&D", [this.RT_2NET_WEIGHT]],
            [this.DT_2NET_PULSEOX, "2net fancy pulse ox", "9560 Onyx II", "Nonin", [this.RT_2NET_PULSEOX]]
        ];

        return this;
    },

    isValidDeviceType: function(deviceTypeId) {
        return _.contains(this._deviceTypeIds, deviceTypeId);
    },

    initDB: function(callback) {
        var self = this;

        self._initReadingTypes(function(err, value) {
            if (err) {
                return callback(err, null);
            }
            self._initDeviceTypes(callback);
        })
    },

    _initDeviceTypes: function(callback) {
        var results = [];
        var localDeviceTypes = this._deviceTypes.slice(0);
        function createDeviceType(dt) {
            if (dt) {
                $$.dao.DeviceTypeDao.createDeviceType(dt[0], dt[1], dt[2], dt[3], dt[4], function(err, result) {
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
    },

    _initReadingTypes: function(callback) {
        var results = [];
        var localReadingTypes = this._readingTypes.slice(0);
        function createReadingType(rt) {
            if (rt) {
                $$.dao.ReadingTypeDao.createReadingType(rt[0], rt[1], rt[2], function(err, result) {
                    if (err) {
                        return callback(err, null);
                    }
                    results.push(result);
                    return createReadingType(localReadingTypes.shift());
                });
            } else {
                return callback(null, results.length);
            }
        }
        createReadingType(localReadingTypes.shift());
    }
};

twonetDeviceTypes = _.extend(twonetDeviceTypes).init();
module.exports = twonetDeviceTypes;