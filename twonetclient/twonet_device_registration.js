var https = require('https');
var util = require('util');
var TwoNetBase = require('./twonet_base');

var DeviceRegistration = function() {
    this.init.apply(this, arguments);
}

_.extend(DeviceRegistration.prototype, TwoNetBase.prototype, {

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
     *
     * @param user_guid uuid to register
     * @param callback client callback
     */
    getUserDevices: function(user_guid, callback) {

        var options = this.twonetOptions(this.HTTP_METHOD.GET, util.format(this.GET_USER_DEVICES_ENDPOINT, user_guid));

        this.logUrl(options);

        var req = https.request(options, function(res) {
            console.log("==> Response status code: " + res.statusCode);

            res.on('data', function(data) {
                var response = JSON.parse(data);
                console.log("==> Response: " + JSON.stringify(response));
                if (res.statusCode != 200) {
                    return callback(new Error(JSON.stringify(response)), null);
                }

                return callback(null, response);
            });
        });

        req.end();
    },

    /******************************************************************************************************************
     * Registers a device for a user
     *
     * Example Request:
     * HTTP POST
     *
     * Example Response:
     *
     * @param user_guid user uuid
     * @param serial device serial number
     * @param model device model
     * @param make device manufacturer
     * @param callback client callback
     */
    register2netDevice: function(user_guid, serial, model, make, callback) {

        var body = JSON.stringify({
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
        });

        var options = this.twonetOptions(this.HTTP_METHOD.POST, this.REGISTER_DEVICE_ENDPOINT);

        this.logUrl(options);
        console.log("==> Request: " + body);

        var req = https.request(options, function(res) {
            console.log("==> Response status code: " + res.statusCode);
            //console.log("headers: ", res.headers);

            res.on('data', function(d) {
                var response = JSON.parse(d);
                console.log("==> Response: " + JSON.stringify(response));
                if (res.statusCode != 200) {
                    //console.log("status:" + response['errorStatus']['status'])
                    //console.log("code:" + response['errorStatus']['code'])
                    //console.log("message:" + response['errorStatus']['message'])
                    return callback(new Error(JSON.stringify(response)), null);
                }

                return callback(null, response);
            });
        });

        req.write(body);
        req.end();
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

        var options = this.twonetOptions(this.HTTP_METHOD.GET,
            util.format(this.GET_USER_REGISTRABLE_DEVICES_ENDPOINT, user_guid));

        this.logUrl(options);

        var req = https.request(options, function(res) {
            console.log("==> Response status code: " + res.statusCode);

            res.on('data', function(d) {
                var response = JSON.parse(d);
                console.log("==> Response: " + JSON.stringify(response));
                if (res.statusCode != 200) {
                    return callback(new Error(JSON.stringify(response)), null);
                }

                return callback(null, response);
            });
        });

        req.end();
    }
});

module.exports = new DeviceRegistration();