var AuthenticationDao = require('../dao/authentication.dao');
var UserDao = require('../dao/user.dao');
var cookies = require("../utils/cookieutil");

module.exports = {

    handleLoginCallback: function(socialType, req, accessToken, refreshToken, profile, scope, done) {
        var email, firstName, lastName, socialId, username, profileUrl, name;

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

            UserDao.createUserFromSocialProfile(socialType, socialId, email, firstName, lastName, username, profileUrl, accessToken, accountToken, scope, function(err, value) {
                if (err) {
                    return done(null, false, err);
                } else {
                    if (value != null) {
                        return done(null, value);
                    } else {
                        return done(null, false, {message:"User not created"});
                    }
                }
            });
        } else {
            //Logging in as usual.
            AuthenticationDao.authenticateBySocialLogin(req, socialType, socialId, email, username, profileUrl, accessToken, scope, function(err, value) {
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
