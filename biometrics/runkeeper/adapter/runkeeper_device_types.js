require('../../platform/dao/devicetype.dao');
require('../../platform/dao/readingtype.dao');

var ValueTypes = require('../../platform/bio_value_types');

var rkDeviceTypes = {

    /**
     * Reading types
     */
    RT_RK_ACTIVITY: "runkeeper_activity",

    /**
     * Device types
     */
    DT_RUNKEEPER: "RunKeeper",

    init: function() {

        this._readingTypesIds = [
            this.RT_RK_ACTIVITY
        ];

        this._readingTypes = [
            [this.RT_RK_ACTIVITY, "RunKeeper activity reading", [ValueTypes.VT_CALORIES, ValueTypes.VT_DISTANCE, ValueTypes.VT_ACTIVITY_TYPE]]
        ];

        this._deviceTypeIds = [
            this.DT_RUNKEEPER
        ];

        this._deviceTypes = [
            [this.DT_RUNKEEPER, "RunKeeper", "RunKeeper", "RunKeeper", [this.RT_RK_ACTIVITY]]
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

rkDeviceTypes = _.extend(rkDeviceTypes).init();
module.exports = rkDeviceTypes;