var appConfig = require('../configs/app.config');

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
        RESET_PASSWORD_URL: "{RESET_PASSWORD_URL}"
    },

    serverUrl: appConfig.server_url,
    supportEmail: appConfig.support_email,
    //endregion


    //region PUBLIC
    resetPassword: function(resetPasswordToken, user, toEmail, fn) {
        var self = this;

        var tokens = {};
        tokens[this.tokens.USER_EMAIL] = user.get("email") || toEmail;
        tokens[this.tokens.RESET_PASSWORD_URL] = this.serverUrl + "/forgotpassword/reset/" + resetPasswordToken;

        var options = {};
        if (user != null) {
            options.user = user;
        }

        this.log.info("Sending password recovery email");

        this._sendTemplate("emails/forgotpassword",
            tokens,
            toEmail,
            "Reset your password",
            options,
            fn
        );
    },
    //endregion PUBLIC


    //region PRIVATE
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
                $$.g.mailer.sendMail(null, to, null, subject, emailStr, function(err, value) {
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
