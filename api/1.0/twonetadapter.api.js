/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var twonetAdapter = require('../../biometrics/twonet/adapter/twonet_adapter.js');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "twonetadapter",

    log: $$.g.getLogger("twonetadapter.api"),

    initialize: function() {
        app.post(this.url('subscription'), this.subscribeContact.bind(this));
        app.post(this.url('device'), this.registerDevice.bind(this));
        app.delete(this.url('subscription/:id'), this.unsubscribeContact.bind(this));
    },

    subscribeContact: function(req,resp) {
        console.log('subscribing contact');
        var self = this;

        twonetAdapter.subscribeContact(req.body.contactId, function(err, value) {
            if (err) {
                var errorMsg = "There was an error subscribing contact " + req.params.id + " from 2net services: "
                    + err.message;
                self.log.error(errorMsg);
                self.log.error(err.stack);
                self.wrapError(resp, 500, errorMsg, err, value);
            } else {
                self.sendResult(resp, value);
            }
        })
    },

    unsubscribeContact: function(req,resp) {
        var self = this;

        twonetAdapter.unsubscribeContact(req.params.id, function(err, value) {
            if (err) {
                var errorMsg = "There was an error unsubscribing contact " + req.params.id + " from 2net services: "
                    + err.message;
                self.log.error(errorMsg);
                self.log.error(err.stack);
                self.wrapError(resp, 500, errorMsg, err, value);
            } else {
                self.sendResult(resp, value);
            }
        })
    },

    registerDevice: function(req, resp) {
        var self = this;

        twonetAdapter.registerDevice(
            req.body.contactId,
            req.body.deviceTypeId,
            req.body.serialNumber,

            function(err, value) {
                if (err) {
                    var errorMsg = "There was an error registering device for contact " + req.body.contactId + ": "
                        + err.message;
                    self.log.error(errorMsg);
                    self.log.error(err.stack);
                    self.wrapError(resp, 500, errorMsg, err, value);
                } else {
                    self.sendResult(resp, value);
                }
        })
    }
});

module.exports = new api();

