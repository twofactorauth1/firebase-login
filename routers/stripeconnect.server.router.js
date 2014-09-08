/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseRouter = require('./base.server.router.js');
var passport = require('passport');
var appConfig = require('../configs/app.config');
var stripeConfig = require('../configs/stripe.config');



var router = function() {
    this.init.apply(this, arguments);
};

_.extend(router.prototype, baseRouter.prototype, {

    base: "stripe",

    initialize: function() {
        this.log.debug('>> initialize');
        // ------------------------------------------------
        //  CONNECT
        // ------------------------------------------------

        app.get('/stripe/connect', passport.authenticate('stripe', { scope: 'read_write' }));
        app.get('/stripe/connect/callback', passport.authenticate('stripe', { failureRedirect: '/login' }), this.handleStripeCallback.bind(this));

        this.log.debug('<< initialize');
        return this;
    },

    handleStripeCallback: function(req, res) {
        var self = this;
        self.log.debug('>> handleStripeCallback');
        self.log.debug('<< handleStripeCallback');
        res.redirect('/login');
    }

});

module.exports = new router();

