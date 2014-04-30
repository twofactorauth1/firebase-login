var readingTypeDao = require('./dao/readingtype.dao.js');

module.exports = {

    initialize: function(callback) {

        /**
         * Reading types are owned by the platform's biometrics component. They are meant to be shared among
         * different device types. This is the reason why these are defined here.
         */
        var readingTypes = [
            ["weight", "lb", "force on the body due to gravity"],
            ["pulse", "count per minute", "arterial palpation of the heartbeat"],
            ["spo2", "%", "blood oxygen saturation"],
            ["systolic", "mmHg", "pressure in the arteries when the heart beats"],
            ["diastolic", "mmHg", "pressure in the arteries between heart beats"]
        ];

        var results = [];
        function createReadingType(rt) {
            if (rt) {
                readingTypeDao.createReadingType(rt[0], rt[1], rt[2], function(err, result) {
                    results.push(result);
                    return createReadingType(readingTypes.shift());
                });
            } else {
                return callback(null, results.length);
            }
        }
        createReadingType(readingTypes.shift());
    }
};