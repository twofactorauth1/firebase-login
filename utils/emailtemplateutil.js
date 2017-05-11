/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var appConfig = require('../configs/app.config');
var accountDao = require('../dao/account.dao');
var emailMessageManager = require('../emailmessages/emailMessageManager');

//region CLASS - TOKENIZABLE
var Tokenizable = function(str) {
    this.init(str);
};

_.extend(Tokenizable.prototype, {

    str:"",

    init: function(str, tokens) {
        this.str = str;
        return this;
    },

    replace: function(token, value) {
        var regExp = new RegExp(token, "g");
        this.str = this.str.replace(regExp, value);
        return this;
    },

    value: function() {
        return this.str;
    }
});
//endregion

var emailTemplateUtil = {

    log: $$.g.getLogger("EmailTemplateUtil"),

    //region TOKENS
    tokens: {

        // GENERAL
        SUPPORT_EMAIL: "{SUPPORT_EMAIL}",
        SERVER_URL: "{SERVER_URL}",
        EMAIL: "{EMAIL}",

        // USER
        FULL_NAME: "{FULL_NAME}",
        USERNAME: "{USERNAME}",
        USER_EMAIL: "{USER_EMAIL}",

        // AUTHENTICATEION
        RESET_PASSWORD_URL: "{RESET_PASSWORD_URL}",

        // SYSTEM INFO
        SYSTEM_INFO: "{SYSTEM_INFO}"
    },

    serverUrl: appConfig.server_url,
    wwwUrl: appConfig.www_url,
    supportEmail: appConfig.support_email,
    //endregion


    //region PUBLIC
    resetPassword: function(accountId, resetPasswordToken, user, toEmail, props, fn) {
        var self = this;       
        if(accountId === appConfig.mainAccountID) {
            // we don't want the actual URL for 'main'... instead, we want www.
            accountId = 0;
        }
        this._getServerUrl(accountId, function(err, value) {
            if (err) {
                return fn(err, value);
            }

            var url = value;
            var tokens = {};
            tokens[self.tokens.USER_EMAIL] = user.get("email") || toEmail;
            tokens[self.tokens.RESET_PASSWORD_URL] = url + "/forgotpassword/reset/" + resetPasswordToken + '?email=' +  encodeURIComponent(toEmail);
            tokens[self.tokens.SYSTEM_INFO] = "Date: "+ props.date + "<br/>" +
                                              "Browser: "+ props.browser + "<br/>" +
                                              "Operating System: "+ props.os + "<br/>" +
                                              "IP Address: "+ props.ip

            var options = {};
            if (user != null) {
                options.user = user;
            }

            self.log.info("Sending password recovery email");

            self._sendTemplate("emails/forgotpassword",
                tokens,
                toEmail,
                "Reset your password",
                options,
                fn
            );
        });
    },
    //endregion PUBLIC


    //region PRIVATE
    _getServerUrl: function(accountId, fn) {
        if (accountId > 0) {
            return accountDao.getServerUrlByAccount(accountId, fn);
        } else {
            return fn(null, this.wwwUrl);
        }
    },


    _sendTemplate: function(template, tokens, to, subject, options, fn) {
        if (_.isFunction(options)) {
            fn = options;
            options = {};
        }

        var self = this;
        app.render(template, function(err, value) {
            if (!err) {
                var tokenizable = new Tokenizable(value);
                self._tokenizeGeneric(tokenizable, options);

                for(var key in tokens) {
                    tokenizable.replace(key, tokens[key]);
                }

                var emailStr = tokenizable.value();
                emailMessageManager.sendBasicEmail(appConfig.support_email, 'Indigenous Support', to, null, subject, emailStr, 0, [], null, null, false, function(err, value){
                    if (!err) {
                        fn(null, "ok");
                    } else {
                        fn(err, value);
                    }
                });
            } else {
                fn(err, value);
            }
        });
    },


    _tokenizeGeneric: function(tokenizable, options){
        options = options || {};

        tokenizable
            .replace(this.tokens.SERVER_URL, this.serverUrl)
            .replace(this.tokens.SUPPORT_EMAIL, this.supportEmail);

        this._tokenizeUser(tokenizable, options.user);

        return tokenizable;
    },


    _tokenizeUser: function(tokenizable, user) {
        if (user != null) {
            tokenizable.replace(this.tokens.FULL_NAME, user.fullName());
        }
        return tokenizable;
    }
    //endregion PRIVATE
};

module.exports = emailTemplateUtil;
