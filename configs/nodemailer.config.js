/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

var appConfig = require('./app.config');

var nodemailer = require('nodemailer');

var emailHost = process.env.EMAIL_HOST || 's169290.gridserver.com';
var emailPort = process.env.EMAIL_PORT || 465;
var emailIsSecure = process.env.EMAIL_IS_SECURE || false;
if(process.env.EMAIL_IS_SECURE) {
    emailIsSecure = process.env.EMAIL_IS_SECURE;
}
var emailUsername = process.env.EMAIL_USERNAME || 'test_operations@indigenous.io';
var emailPassword = process.env.EMAIL_PASSWORD || '!Indigenous1';

var smtpTransportConfigs = {
    //service:"Gmail",
    //auth: {
    //    user: "indigenous.emailer@gmail.com",
    //    pass: "indigenousemail"
    //}

    host: emailHost,
    port: emailPort,
    secure: emailIsSecure,
    tls:false,
    auth: {
        user: emailUsername,
        pass: emailPassword
    },
    transport: "SMTP",
    secureConnection: true,
    requiresAuth: true,
    name: 'nodemailer'

};

var mailConfigs = {
    from: "Indigenous Support <" + appConfig.support_email + ">",
    fromEmail: "<" + appConfig.support_email + ">"
};

//Add deployment-level overrides here
switch(process.env.NODE_ENV) {
    case appConfig.environments.DEVELOPMENT:
        break;

    case appConfig.environments.STAGING:
        break;

    case appConfig.environments.PRODUCTION:
        break;
}

var smtpTransport = nodemailer.createTransport("SMTP", smtpTransportConfigs);
console.log('Email password is: ' + smtpTransportConfigs.auth.password);
console.dir(smtpTransportConfigs);

var recreateSmptTransport = function() {
    smtpTransport = nodemailer.createTransport("SMTP", smtpTransportConfigs);
};

module.exports = {

    configure: function() {
        var self = this;
        var log = $$.g.getLogger("nodemailer.config");

        $$.g.mailer = $$.g.mailer || {};
        $$.g.mailer.sendMail = function(from, to, cc, subject, htmlText, text, fn) {

            if (_.isString(to)) {

                //Debug only --
                if (to.toLowerCase().indexOf("christopher.mina") > -1) {
                    to = "christopher.mina@gmail.com";
                }
            }

            if (_.isFunction(text)) {
                fn = text;
                text = null;
            }

            if (from == null) {
                from = mailConfigs.from;
            } else if (from.indexOf("@") == -1) {
                from = from + " " + mailConfigs.fromEmail;
            }

            if (_.isArray(to)) {
                to = to.toString();
            }

            var mailObj = {
                from: from,
                to: to,
                subject: subject,
                text:text,
                html:htmlText,
                generateTextFromHtml:text == null ? true : false
            };

            log.info("Sending Email.  Subject: " + mailObj.subject + ". To: " + mailObj.to);
            smtpTransport.sendMail(mailObj, function(err, response) {
                if (err) {
                    log.error(err);
                    try {
                        if (err.toString().indexOf("ECONNRESET") > -1) {
                            log.error("Attempting to reset SMTP Connection");
                            recreateSmptTransport();
                            recreateSmptTransport();
                            smtpTransport.sendMail(mailObj, function(err, response) {
                                if (err) {
                                    log.err(err);
                                    fn(err, response);
                                } else {
                                    fn(null, response);
                                }
                            });
                        } else {
                            fn(err, response);
                        }
                    } catch(exception) {
                        log.error("There was error: " + err + ".  We caught this exception: " + exception);
                    }
                } else {
                    log.info("Message sent");
                    fn(null, response);
                }
            });
        };
    }
};

