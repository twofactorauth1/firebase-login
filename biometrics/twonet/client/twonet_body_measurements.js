var TwoNetBase = require('./twonet_base');

var bodyMeasurements = {

    options: {
        name: "twonet_body_measurements"
    },

    GET_LATEST_MEAS_ENDPOINT: String("/partner/measure/body/latest"),

    GET_MEAS_RANGE_ENDPOINT: String("/partner/measure/body/filtered"),

    /******************************************************************************************************************
     * Returns the last recorded body measurement
     *
     * https://indigenous.atlassian.net/wiki/display/PLAT/2Net#id-2Net-GetLatestBodyMeasurement
     *
     * When this operation succeeds, it pases a JSON reading object to the callback function,
     * for example:
     *
     * {
     *    "time": 1395668450,
     *    "body": {
     *        "weight": 174.80452
     *    },
     *    "device": {
     *        "time": "2014-03-24 13:51:56"
     *    },
     *    "guid": "88994ce4-c684-d4c6-aa84-9c6145263fae"
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
     * Gets body measurements in a given date range
     * https://indigenous.atlassian.net/wiki/display/PLAT/2Net#id-2Net-GetBodyMeasurementsbyDateRange
     *
     * When this operation succeeds, it pases a JSON array of readings to the callback function or an empty array,
     * for example:
     *
     * [
     * {
     *    "time": 1395668450,
     *    "body": {
     *        "weight": 174.80452
     *    },
     *    "device": {
     *        "time": "2014-03-24 13:51:56"
     *    },
     *    "guid": "88994ce4-c684-d4c6-aa84-9c6145263fae"
     * },
     * {
     *    "time": 1395668446,
     *    "body": {
     *        "weight": 175.20135
     *    },
     *    "device": {
     *        "time": "2014-03-22 15:15:01"
     *    },
     *    "guid": "b447b36e-d7e5-2c7f-7978-85bef430883f"
     * }]
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
};

bodyMeasurements = _.extend(bodyMeasurements, TwoNetBase.prototype, bodyMeasurements.options).init();
module.exports = bodyMeasurements;