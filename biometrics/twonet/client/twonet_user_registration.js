var util = require('util');
var TwoNetBase = require('./twonet_base');

var userRegistration = {

    options: {
        name: "twonet_user_registration"
    },

    USER_REGISTER_ENDPOINT: "/partner/register",

    USER_UNREGISTER_ENDPOINT: String("/partner/user/delete/%s"),

    /********************************************************************
     * Registers a user with the 2net API
     *
     * Example Request:
     * HTTP POST https://twonetcom.qualcomm.com/kernel/partner/register
     * {"registerRequest":{"guid":"ca175c45-7112-4c69-af49-ab8f85abf75b"}}
     *
     * Example Response:
     * {"trackGuidsResponse":{"status":{"code":1,"message":"OK"}}}
     *
     * @param user_guid uuid to register
     * @param callback client callback
     */
    register: function(user_guid, callback) {

        var body = {registerRequest:{guid:user_guid}};

        var that = this;
        this.httpPost(this.USER_REGISTER_ENDPOINT, body, function(err, response) {
            if (err) {
                callback(err, null);
            } else {
                if (response.trackGuidsResponse.status.message != that.RESPONSE_STATUS.OK) {
                    callback(new Error("Unexpected status message"), response);
                } else {
                    callback(null, user_guid);
                }
            }
        });
    },

    /********************************************************************
     * Un-registers a user with the 2net API
     *
     * Example Request (DELETE):
     * HTTP DELETE: https://twonetcom.qualcomm.com/kernel/partner/user/delete/ca175c45-7112-4c69-af49-ab8f85abf75b
     * (no data)
     *
     * Example Response:
     * {"statusResponse":{"status":{"code":1,"message":"OK"}}}
     *
     * @param user_guid uuid to un-register
     * @param callback client callback
     */
    unregister: function(user_guid, callback) {

        var that = this;
        this.httpDelete(util.format(this.USER_UNREGISTER_ENDPOINT, user_guid), function(err, response) {
            if (err) {
                callback(err, null);
            } else {
                if (response.statusResponse.status.message != that.RESPONSE_STATUS.OK) {
                    callback(new Error("Unexpected status message"), response);
                } else {
                    callback(null, user_guid);
                }
            }
        });
    }
};

userRegistration = _.extend(userRegistration, TwoNetBase.prototype, userRegistration.options).init();
module.exports = userRegistration;