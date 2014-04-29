var TwoNetBase = require('./twonet_base');

var BloodMeasurements = function() {
    this.init.apply(this, arguments);
}

_.extend(BloodMeasurements.prototype, TwoNetBase.prototype, {

    GET_LATEST_MEAS_ENDPOINT: String("/partner/measure/blood/latest"),

    GET_MEAS_RANGE_ENDPOINT: String("/partner/measure/blood/filtered"),

    /**
     * Returns the last recorded blood measurement
     *
     * https://indigenous.atlassian.net/wiki/display/PLAT/2Net#id-2Net-GetLatestBloodMeasurement
     *
     * When this operation succeeds, it pases a JSON reading object to the callback function,
     * for example (for BPM device):
     *
     * {
     *   "time": "1396555185",
     *   "blood": {
     *      "pulse": "59.0",
     *      "systolic": "112.0",
     *      "diastolic": "90.0",
     *      "map": "100.0"
     *   },
     *   "device": {
     *      "time": "2014-04-03 20:02:29"
     *   },
     *   "guid": "7b9793bb-021d-e828-d920-8087ca3a2f45"
     * }
     *
     * The "guid" above is the "reading id"
     */
    getLatestMeasurement: function(userGuid, deviceGuid, callback) {

        var body = {
            "measureRequest": {
                "guid": userGuid,
                "trackGuid": deviceGuid
            }
        };

        var that = this;
        this.httpPost(this.GET_LATEST_MEAS_ENDPOINT, body, function(err, response) {
            if (err) {
                callback(err, null);
            } else {
                if (response.measureResponse.status.message != that.RESPONSE_STATUS.OK) {
                    callback(new Error("Unexpected status message"), response);
                } else {
                    callback(null, response.measureResponse.measures.measure);
                }
            }
        });
    },

    /**
     * Gets blood measurements in a given date range
     * https://indigenous.atlassian.net/wiki/display/PLAT/2Net#id-2Net-GetBloodMeasurementsbyDateRange
     *
     * When this operation succeeds, it pases a JSON array of readings to the callback function or an empty array,
     * for example (BPM):
     *
     * [
     * {
     *     "time": "1396555185",
     *      "blood": {
     *        "pulse": "59.0",
     *        "systolic": "112.0",
     *        "diastolic": "90.0",
     *        "map": "100.0"
     *     },
     *     "device": {
     *        "time": "2014-04-03 20:02:29"
     *     },
     *     "guid": "7b9793bb-021d-e828-d920-8087ca3a2f45"
     * },
     * {
     *    "time": "1396555139",
     *    "blood": {
     *        "pulse": "59.0",
     *        "systolic": "127.0",
     *        "diastolic": "85.0",
     *        "map": "101.0"
     *    },
     *    "device": {
     *        "time": "2014-04-03 20:01:46"
     *    },
     *    "guid": "7e8089e9-87e0-61d9-4089-54713347ab77"
     * }
     * ]
     *
     * The "guid" above is the "reading id"
     *
     * @param userGuid the 2net user id
     * @param deviceGuid the 2net device id
     * @param startDate number of seconds since epoch
     * @param endDate number of seconds since epoch
     * @param callback function to call back
     */
    getMeasurementsByRange: function(userGuid, deviceGuid, startDate, endDate, callback) {

        var body = {
            "measureRequest": {
                "guid": userGuid,
                "trackGuid": deviceGuid,
                "filter": {
                    "startDate": startDate,
                    "endDate": endDate
                }
            }
        };

        var that = this;
        this.httpPost(this.GET_MEAS_RANGE_ENDPOINT, body, function(err, response) {
            if (err) {
                callback(err, null);
            } else {
                if (response.measureResponse.status.message != that.RESPONSE_STATUS.OK) {
                    callback(new Error("Unexpected status message"), response);
                } else {
                    callback(null, that.convertToArray(response.measureResponse.measures.measure))
                }
            }
        });
    }
});

module.exports = new BloodMeasurements();