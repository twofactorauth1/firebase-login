/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseApi = require('../base.api');
var rkAdapter = require('../../biometrics/runkeeper/adapter/runkeeper_adapter');

var api = function() {
    this.init.apply(this, arguments);
};

_.extend(api.prototype, baseApi.prototype, {

    base: "runkeeperadapter",

    log: $$.g.getLogger("runkeeperadapter.api"),

    /**
     * TODO: These APIs are setup this way now to support testing of the backend authorization flow. For example,
     * I am having RunKeeper coming back directly to this REST layer after authorization. It's possible we'll push
     * the round trip flow to the UI layer and will just adjust these APIs later.
     * out to the UIO
     */
    initialize: function() {

        /**
         * I have this as GET instead of POST as this for now will redirect to RunKeeper for authorization
         */
        app.get(this.url('authorization'), this.authorizeContact.bind(this));

        /**
         * I have this as GET instead of POST because I'll have RunKeeper come back to this after user authorizes
         */
        app.get(this.url('subscription'), this.subscribeContact.bind(this));

        /**
         * To delete and disconnect the user from RunKeeper
         */
        app.delete(this.url('subscription/:id'), this.unsubscribeContact.bind(this));
    },

    authorizeContact: function(req, res) {
        if (!req.query.contactId) {
            this.log.debug("No contact id was provided to RunKeeper's subscribeContact");
            this.wrapError(res, 400, "Subscription attempt failed", new Error("No contact id provided"), null);
        } else {
            // send user to RunKeeper for authorization
            var authUrl = rkAdapter.getAuthorizationURL(req.query.contactId);
            this.log.debug("Redirecting user to " + authUrl);
            res.redirect(authUrl);
        }
    },

    subscribeContact: function(req, res) {
        var self = this;

        if (!req.query.code || !req.query.state) {
            self.log.debug("No authorization code or state was provided by RunKeeper");
            self.wrapError(res, 400, "Authorization attempt failed", new Error("No authorization code or state provided"), null);
        } else {
            rkAdapter.subscribe(req.query.state, req.query.code, function (err, value) {
                if (err) {
                    self.wrapError(res, 500, "Authorization attempt failed", err, value);
                } else {
                    self.sendResult(res, value);
                }
            })
        }
    },

    unsubscribeContact: function(req,res) {
        var self = this;

        if (!req.params.id) {
            self.log.debug("No subscription id (contact id) was provided");
            self.wrapError(res, 400, "Unsubscribe attempt failed", new Error("No subscription id (contact id) was provided"), null);
        }

        rkAdapter.unsubscribe(req.params.id, function(err, value) {
            if (err) {
                self.log.error(err.message);
                self.wrapError(res, 500, "Unsubscribe attempt failed", err, value);
            } else {
                self.sendResult(res, value);
            }
        })
    }
});

module.exports = new api();

