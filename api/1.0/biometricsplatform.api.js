/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var deviceManager = require('../../biometrics/platform/bio_device_manager.js');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "biometrics",

    log: $$.g.getLogger("biometricsplatform.api"),

    initialize: function() {
        app.get(this.url('readings'), this.findReadings.bind(this));
    },

    findReadings: function(req,resp) {
        var self = this;
        var contactId = req.query['contactId'];
        deviceManager.findReadings(contactId, function(err, value) {
            self.sendResultOrError(resp, err, value, "Error Retrieving Readings by contactId");
            //self.sendResult(resp, value);
            self = null;
        })
    }
});

module.exports = new api();

