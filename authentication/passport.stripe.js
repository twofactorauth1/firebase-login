/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

var passport = require('passport');
var StripeStrategy = require('passport-stripe').Strategy;
var stripeConfig = require('../configs/stripe.config');
var constants = requirejs("constants/constants");
var passportUtil = require('./passport.socialutil');
var userDao = require('../dao/user.dao');
var log = $$.g.getLogger('passport.stripe');

passport.use(new StripeStrategy({
        clientID: stripeConfig.KM_STRIPE_TEST_CLIENT_ID,
        clientSecret: stripeConfig.KM_STRIPE_TEST_SECRET_KEY,
        callbackURL: "http://localhost:3000/auth/stripe/callback"
    },
    function(req, accessToken, refreshToken, stripe_properties, done) {
        /*
           stripe_properties.stripe_publishable_key
           stripe_properties.stripe_user_id
         */
        log.debug('>> callback(' + accessToken +',' + refreshToken + ',' + stripe_properties);
        userDao.getUserByUsername(req.user.id(), function(err, value) {

            if (value == null) {
                log.error("No user found during stripe callback. (" + err + ")");
                return fn("User not found", "Incorrect username");
            }
            var user = value;
            var stripeAccount = {};
            /**
             * [{
             *  type:int,
             *  username:string,
             *  password:string,     //Local only
             *  socialId:string,     //social only
             *  accessToken:string,  //social only
             *  refreshToken:string, //social only
             *  socialUrl:string,     //social only
             *  scope:string,
             *  baggage: {}
             * }]
             */
            stripeAccount.type=0;//IDK
            stripeAccount.userName = stripe_properties.stripe_user_id;
            stripeAccount.socialId = 'stripe';
            stripeAccount.accessToken = accessToken;
            stripeAccount.refreshToken = refreshToken;
            user.accounts.push(stripeAccount);
            userDao.saveOrUpdate(user, function(err, value){
                if(value==null) {
                    log.error("Error during saveOrUpdate of user: (" + err + ")");
                    return fn(err, "SaveOrUpdate Error");
                }
            });

        });

        User.findOrCreate({ stripeId: stripe_properties.stripe_user_id }, function (err, user) {
            return done(err, user);
        });
    }
));