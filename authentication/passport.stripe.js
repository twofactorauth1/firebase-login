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
var accountDao = require('../dao/account.dao');

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
            console.log('state: ', state);
            var stateParams = state.split(',');
            stripeAccount.baggage.accountId = parseInt(stateParams[0]);
            req.session.accountId = parseInt(stateParams[0]);
            if(!req.user) {
                userId = parseInt(stateParams[1]);
                req.session.accountId = parseInt(stateParams[0]);
            } else {
                userId = req.user.id();
            }
        }
        console.log('req.session.accountId: ' + req.session.accountId);
        userDao.getById(userId, function(err, value){
            if (value == null || err) {
                log.error("No user found during stripe callback for userId[" + userId + "]. (" + err + ")");
                return done("User not found", "Incorrect username");
            }
            var user = value;

            user._setCredentials(stripeAccount, false);
            // add accessToken to account.
            accountDao.addStripeTokensToAccount(stripeAccount.baggage.accountId, accessToken, refreshToken, function(err, value){
                if(err) {
                    log.error('Error saving Stripe Tokens to account: ' + err);
                }
            });
            userDao.saveOrUpdate(user, function(err, value){
                if(value==null) {
                    log.error("Error during saveOrUpdate of user: (" + err + ")");
                    return done(err, "SaveOrUpdate Error");
                }
                log.debug('<< stripeCallback');
                return done(err, value);
            });
        });

    }
));