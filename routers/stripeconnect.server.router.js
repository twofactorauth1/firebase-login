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
        app.get('/stripe/connect/callback', passport.authenticate('stripe', { scope: 'read_write', failureRedirect: '/login' }), this.handleStripeCallback.bind(this));

        this.log.debug('<< initialize');
        return this;
    },

    handleStripeCallback: function(req, res) {
        var self = this;
        self.log.debug('>> handleStripeCallback ', req.headers.referer); //.sessionStore.session.state.redirectUrl
        //self.log.debug('authenticated accountId:', self.authenticatedAccountId(req));
        //var accountId = self.accountId(req);
        var accountId = self.authenticatedAccountId(req);
        var path = "admin/#/account/integrations";
        // if (req.headers.referer) {
        //     var _str1 = req.headers.referer.split("?next=")[1];
        //     var _str2 = _str1.split("stripe/connect/callback/redirectTo/");
        //     path = _str2[1];
        //     self.log.debug('>> path ', path);
        // }

        authenticationDao.getAuthenticatedUrlForAccount(accountId, req.user.id(), path, null, function(err, value) {
            self.log.debug('<< handleStripeCallback');
            if (err) {
                res.redirect("/home");
            } else {
                res.redirect(value);
            }
            self.createUserActivityWithParams(accountId, req.user.id(), 'CONNECT_STRIPE_ACCOUNT', null, null, function(){});
        });

        //res.redirect('/login');
    }

});

module.exports = new router();

