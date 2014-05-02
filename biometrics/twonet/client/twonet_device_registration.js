var util = require('util');
var TwoNetBase = require('./twonet_base');

var deviceRegistration = {

    options: {
        name: "twonet_device_registration"
    },

    GET_USER_DEVICES_ENDPOINT: String("/partner/user/tracks/details/%s"),

    GET_USER_REGISTRABLE_DEVICES_ENDPOINT: String("/partner/user/tracks/registerable/%s"),

    REGISTER_DEVICE_ENDPOINT: String("/partner/user/track/register"),

    /******************************************************************************************************************
     * getUserDevices
     *
     * Provides a complete list of tracks (devices) that are currently registered to the user.
     *
     * Example Request:
     * HTTP GET https://twonetcom.qualcomm.com/kernel/partner/user/tracks/registerable/ca175c45-7112-4c69-af49-ab8f85ab
     *
     * Example Response:
     *
     * [
     * {
     *    "guid": "b64d7234-2398-021d-2b64-b5999a31aaff",
     *    "type": "2net",
     *    "properties": {
     *        "property": [
     *            {
     *                "name": "make",
     *                "value": "A&D"
     *            },
     *            {
     *                "name": "model",
     *                "value": "UC-321PBT"
     *            }
     *        ]
     *    },
     *    "authenticated": true,
     *    "supportsBodyMeasures": true,
     *    "supportsBloodMeasures": false,
     *    "supportsActivity": false,
     *    "supportsNutrition": false,
     *    "supportsBreath": false,
     *    "supportsSleep": false
     * },
     * {
     * ...
     * }
     * ]
     *
     * @param user_guid uuid to register
     * @param callback client callback
     */
    getUserDevices: function(user_guid, callback) {

        var that = this;
        this.httpGet(util.format(this.GET_USER_DEVICES_ENDPOINT, user_guid), function(err, response) {
            if (err) {
                callback(err, null);
            } else {
                if (response.trackDetailsResponse.status.message != that.RESPONSE_STATUS.OK) {
                    callback(new Error("Unexpected status message"), response);
                } else {
                    callback(null, that.convertToArray(response.trackDetailsResponse.trackDetails.trackDetail));
                }
            }
        });
    },

    /******************************************************************************************************************
     * Registers a device for a user
     *
     * Example Request:
     * HTTP POST
     *
     * Example Response:
     *
     * {
     *       "guid": "1053ea34-2398-a991-1105-b59070725aff",
     *       "type": "2net",
     *       "properties": {
     *           "property": [
     *               {
     *                   "name": "make",
     *                   "value": "A&D"
     *               },
     *               {
     *                   "name": "model",
     *                   "value": "UA-767PBT"
     *               }
     *           ]
     *       },
     *       "authenticated": true,
     *       "supportsBodyMeasures": false,
     *       "supportsBloodMeasures": true,
     *       "supportsActivity": false,
     *       "supportsNutrition": false,
     *       "supportsBreath": false,
     *       "supportsSleep": false
     *   }
     *
     *   Of particular importance is the "guid", which is the device id of the device just registered for
     *   this specific user.
     *
     * @param user_guid user uuid
     * @param serial device serial number
     * @param model device model
     * @param make device manufacturer
     * @param callback client callback
     */
    register2netDevice: function(user_guid, serial, model, make, callback) {

        var body = {
            "trackRegistrationRequest": {
                "guid": user_guid,
                "type": "2net",
                "registerType": "properties",
                "properties": {
                    "property": [
                        {
                            "name": "make",
                            "value": make
                        },
                        {
                            "name": "model",
                            "value": model
                        },
                        {
                            "name": "serialNumber",
                            "value": serial
                        }
                    ]
                }
            }
        };

        var that = this;
        this.httpPost(this.REGISTER_DEVICE_ENDPOINT, body, function(err, response) {
            if (err) {
                callback(err, null);
            } else {
                if (response.trackRegistrationResponse.status.message != that.RESPONSE_STATUS.OK) {
                    callback(new Error("Unexpected status message"), response);
                } else {
                    callback(null, response.trackRegistrationResponse.trackDetail);
                }
            }
        });
    },

    /******************************************************************************************************************
     * getRegisterableDevices
     *
     * Gives a list of all registerable devices for the specific user_guid
     * along with the registration requirements (property based or OAuth registration)
     *
     * Example Request:
     * HTTP GET https://twonetcom.qualcomm.com/kernel/partner/user/tracks/registerable/ca175c45-7112-4c69-af49-ab8f85ab
     *
     * Example Response:
     * See https://indigenous.atlassian.net/wiki/display/PLAT/2Net#id-2Net-RegistrableDevices
     *
     * @param user_guid uuid to register
     * @param callback client callback
     */
    getRegisterableDevices: function(user_guid, callback) {

        this.httpGet(util.format(this.GET_USER_REGISTRABLE_DEVICES_ENDPOINT, user_guid), function(err, response) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, response.trackRegistrationTemplateResponse.trackRegistrationTemplates.trackRegistrationTemplate);
            }
        });
    }
};

deviceRegistration = _.extend(deviceRegistration, TwoNetBase.prototype, deviceRegistration.options).init();
module.exports = deviceRegistration;