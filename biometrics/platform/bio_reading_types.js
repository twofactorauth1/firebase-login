var readingTypeDao = require('./dao/readingtype.dao.js');

/**
 * Reading type keys
 */
var _RT_WEIGHT = "weight";
var _RT_PULSE = "pulse";
var _RT_SP02 = "spo2";
var _RT_SYSTOLIC = "systolic";
var _RT_DIASTOLIC = "diastolic";

module.exports = {

    /**
     * Export reading type keys
     */
    RT_WEIGHT: _RT_WEIGHT,
    RT_PULSE: _RT_PULSE,
    RT_SP02: _RT_SP02,
    RT_SYSTOLIC: _RT_SYSTOLIC,
    RT_DIASTOLIC: _RT_DIASTOLIC,

    readingTypeIds: [
        _RT_WEIGHT,
        _RT_PULSE,
        _RT_SP02,
        _RT_SYSTOLIC,
        _RT_DIASTOLIC
    ],

    /**
     * Reading types are owned by the platform's biometrics component. They are meant to be shared among
     * different device types. This is the reason why these are defined here.
     */
    readingTypes: [
        [_RT_WEIGHT, "lb", "force on the body due to gravity"],
        [_RT_PULSE, "count per minute", "arterial palpation of the heartbeat"],
        [_RT_SP02, "%", "blood oxygen saturation"],
        [_RT_SYSTOLIC, "mmHg", "pressure in the arteries when the heart beats"],
        [_RT_DIASTOLIC, "mmHg", "pressure in the arteries between heart beats"]
    ],

    isValidReadingType: function(readingTypeId) {
        return _.contains(this.readingTypeIds, readingTypeId);
    },

    initDB: function(callback) {
        var results = [];
        var localReadingTypes = this.readingTypes.slice(0);
        function createReadingType(rt) {
            if (rt) {
                readingTypeDao.createReadingType(rt[0], rt[1], rt[2], function(err, result) {
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