var valueTypeDao = require('./dao/valuetype.dao.js');

var bioValueTypes = {

    VT_POUNDS: "pounds",
    VT_PULSE: "pulse",
    VT_SP02: "spo2",
    VT_SYSTOLIC: "systolic",
    VT_DIASTOLIC: "diastolic",

    VT_CALORIES: "calories",
    VT_DISTANCE: "distance",
    VT_ACTIVITY_TYPE: "activity_type",

    init: function() {

        this._valueTypeIds = [
            this.VT_POUNDS,
            this.VT_PULSE,
            this.VT_SP02,
            this.VT_SYSTOLIC,
            this.VT_DIASTOLIC
        ];

        /**
         * Value types are owned by the platform's biometrics component. They are meant to be shared among
         * different reading types. That is the reason why these are defined here.
         */
        this._valueTypes = [
            [this.VT_POUNDS, "lb", "force on the body due to gravity"],
            [this.VT_PULSE, "count per minute", "arterial palpation of the heartbeat"],
            [this.VT_SP02, "%", "blood oxygen saturation"],
            [this.VT_SYSTOLIC, "mmHg", "pressure in the arteries when the heart beats"],
            [this.VT_DIASTOLIC, "mmHg", "pressure in the arteries between heart beats"],

            [this.VT_CALORIES, "calories", "calories burned"],
            [this.VT_DISTANCE, "distance", "distance traveled in meters"],
            [this.VT_ACTIVITY_TYPE, "activity_type", "activity type"]
        ];

        return this;
    },

    isValidValueType: function(valueTypeId) {
        return _.contains(this._valueTypeIds, valueTypeId);
    },

    initDB: function(callback) {
        var results = [];
        var localValueTypes = this._valueTypes.slice(0);
        function createValueType(rt) {
            if (rt) {
                valueTypeDao.createValueType(rt[0], rt[1], rt[2], function(err, result) {
                    if (err) {
                        return callback(err, null);
                    }
                    results.push(result);
                    return createValueType(localValueTypes.shift());
                });
            } else {
                return callback(null, results.length);
            }
        }
        createValueType(localValueTypes.shift());
    }
};

bioValueTypes = _.extend(bioValueTypes).init();
module.exports = bioValueTypes;