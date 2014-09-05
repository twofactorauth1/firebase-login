/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

var passport = require('passport');
//var StripeStrategy = require('passport-stripe').Strategy;
var StripeStrategy = require('./oauth/index.js').Strategy;
var stripeConfig = require('../configs/stripe.config');
var constants = requirejs("constants/constants");
var passportUtil = require('./passport.socialutil');
var userDao = require('../dao/user.dao');
var log = $$.g.getLogger('passport.stripe');
var connect = require('connect');

passport.use(new StripeStrategy({
        clientID: stripeConfig.STRIPE_CLIENT_ID,
        clientSecret: stripeConfig.STRIPE_SECRET_KEY,
        callbackURL: stripeConfig.CALLBACK_URL_LOGIN,
        passReqToCallback: true
    },
    function(req, accessToken, refreshToken, stripe_properties, done) {
        /*
           stripe_properties.stripe_publishable_key
           stripe_properties.stripe_user_id
         */
        log.debug('>> stripeCallback(' + accessToken +',' + refreshToken + ',' + stripe_properties);
        var stripeAccount = {};
        stripeAccount.type='stripe';
        stripeAccount.userName = stripe_properties.stripe_user_id;
        stripeAccount.socialId = 'stripe';
        stripeAccount.accessToken = accessToken;
        stripeAccount.refreshToken = refreshToken;
        stripeAccount.baggage = {};
        stripeAccount.baggage.publishable_key = stripe_properties.stripe_publishable_key;
        stripeAccount.id = function() {
            return accessToken;
        }

        req.session.stripeAccessToken = accessToken;
        var userId = null;
        var state = req.query['state'];
        if(state) {
            var stateParams = state.split(',');
            stripeAccount.baggage.accountId = stateParams[0];
            if(!req.user) {
                userId = state[1];
            } else {
                userId = req.user.id();
            }
        }

        userDao.getById(userId, function(err, value){
            if (value == null) {
                log.error("No user found during stripe callback. (" + err + ")");
                return fn("User not found", "Incorrect username");
            }
            var user = value;

            user._setCredentials(stripeAccount, false);

            userDao.saveOrUpdate(user, function(err, value){
                if(value==null) {
                    log.error("Error during saveOrUpdate of user: (" + err + ")");
                    return fn(err, "SaveOrUpdate Error");
                }
                log.debug('<< stripeCallback');
                return done(err, value);
            });
        });

    }
));