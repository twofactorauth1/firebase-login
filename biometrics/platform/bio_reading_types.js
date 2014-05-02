var readingTypeDao = require('./dao/readingtype.dao.js');

var bioReadingTypes = {

    RT_WEIGHT: "weight",
    RT_PULSE: "pulse",
    RT_SP02: "spo2",
    RT_SYSTOLIC: "systolic",
    RT_DIASTOLIC: "diastolic",

    init: function() {

        this._readingTypeIds = [
            this.RT_WEIGHT,
            this.RT_PULSE,
            this.RT_SP02,
            this.RT_SYSTOLIC,
            this.RT_DIASTOLIC
        ];

        /**
         * Reading types are owned by the platform's biometrics component. They are meant to be shared among
         * different device types. This is the reason why these are defined here.
         */
        this._readingTypes = [
            [this.RT_WEIGHT, "lb", "force on the body due to gravity"],
            [this.RT_PULSE, "count per minute", "arterial palpation of the heartbeat"],
            [this.RT_SP02, "%", "blood oxygen saturation"],
            [this.RT_SYSTOLIC, "mmHg", "pressure in the arteries when the heart beats"],
            [this.RT_DIASTOLIC, "mmHg", "pressure in the arteries between heart beats"]
        ];

        return this;
    },

    isValidReadingType: function(readingTypeId) {
        return _.contains(this._readingTypeIds, readingTypeId);
    },

    initDB: function(callback) {
        var results = [];
        var localReadingTypes = this._readingTypes.slice(0);
        function createReadingType(rt) {
            if (rt) {
                readingTypeDao.createReadingType(rt[0], rt[1], rt[2], function(err, result) {
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

bioReadingTypes = _.extend(bioReadingTypes).init();
module.exports = bioReadingTypes;