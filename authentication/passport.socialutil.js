/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var authenticationDao = require('../dao/authentication.dao');
var userDao = require('../dao/user.dao');
var cookies = require("../utils/cookieutil");

module.exports = {

    handleLoginCallback: function(socialType, req, accessToken, refreshToken, options, profile, scope, done) {
        var email, firstName, lastName, socialId, username, profileUrl, name;
        console.log('>>handleLoginCallback(' + socialType +',req,' + accessToken + ',' + refreshToken +',' + options + ',' + profile + ',' + scope + ')');
        console.dir(profile);
        
        name = profile.displayName;
        socialId = profile.id;
        username = profile.username;
        profileUrl = profile.profileUrl;

        if (profile.emails != null && profile.emails.length > 0) {
            email = profile.emails[0].value;
        }

        if (profile.name != null) {
            firstName = profile.name.givenName;
            lastName = profile.name.familyName;
        }

        if (firstName == null && lastName == null && name != null) {
            var nameParts = $$.u.stringutils.splitFullname(name);
            firstName = nameParts[0];
            lastName = nameParts[2];
        }

        var authMode = req.session.authMode;
        delete req.session.authMode;

        if (authMode == "create") {
            // creating new account
            var accountToken = cookies.getAccountToken(req);

            userDao.createUserFromSocialProfile(socialType, socialId, email, firstName, lastName, username, profileUrl, accessToken, refreshToken, options.expires, accountToken, scope, function (err, value) {
                if (err) {
                    return done(null, false, err);
                } else {
                    if (value != null) {
                        return done(null, value);
                    } else {
                        return done(null, false, {message: "User not created"});
                    }
                }
            });
        } else if(authMode === 'create_in_place'){
            // creating new account
            var accountToken = cookies.getAccountToken(req);

            userDao.createTempUserFromSocialProfile(socialType, socialId, email, firstName, lastName, username, profileUrl, accessToken, refreshToken, options.expires, accountToken, scope, function (err, value) {
                if (err) {
                    return done(null, false, err);
                } else {
                    if (value != null) {
                        return done(null, value);
                    } else {
                        return done(null, false, {message: "User not created"});
                    }
                }
            });
        } else if(authMode == "in_app") {
            authenticationDao.linkSocialAccountToUser(req.session.state.userId, socialType, socialId, email, username, profileUrl, accessToken, refreshToken, options.expires, scope, function(err, value) {
                if (err) {
                    return done(null, false, err);
                } else {
                    if (value != null) {
                        return done(null, value);
                    } else {
                        return done(null, false, {message: "Social account not linked"});
                    }
                }
            });
        } else {
            //Logging in as usual.
            authenticationDao.authenticateBySocialLogin(req, socialType, socialId, email, username, profileUrl, accessToken, refreshToken, options.expires, scope, function(err, value) {
                if (err) {
                    return done(null, false, {message:value});
                }

                if (value != null) {
                    return done(null, value);
                } else {
                    return done(null, false, {message:value});
                }
            });
        }
    }
}
