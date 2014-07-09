/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var baseRouter = require('./base.server.router.js');
var passport = require('passport');
var cookies = require("../utils/cookieutil");
var urlUtils = require('../utils/urlutils');
var appConfig = require('../configs/app.config');
var stripeConfig = require('../configs/stripe.config');
var authenticationDao = require('../dao/authentication.dao');



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
        app.get('/stripe/connect/callback', passport.authenticate('stripe', { scope: 'read_write',
            failureRedirect: '/login' }), this.handleStripeCallback.bind(this));


        this.log.debug('<< initialize');
        return this;
    },

    handleStripeCallback: function(req, res) {
        var self = this;
        self.log.debug('>> handleStripeCallback');
        var user = req.user;
        var account = req.account;
        console.dir(user);
        console.dir(account);

        self.log.debug('<< handleStripeCallback');
        res.redirect('/home');
    }



});

module.exports = new router();

