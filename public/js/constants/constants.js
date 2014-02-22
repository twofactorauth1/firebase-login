if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([], function() {

    var constants = {
        server_props: {
            USER_ID: "userId",
            ACCOUNT_ID: "accountId",
            ROUTER: "router",
            ROOT: "root",
            IS_LOGGED_IN: "isLoggedIn"
        },

        account: {
            company_types: {
                PROFESSIONAL:1,
                BUSINESS:2,
                ENTERPRISE: 3
            },

            company_size: {
                SINGLE: 1,
                SMALL: 2,
                MEDIUM: 3,
                LARGE: 4,
                ENTERPRISE: 5
            }
        },

        contact: {
            detail_types: {
                LOCAL: "lo",
                FACEBOOK: "fb",
                TWITTER: "tw",
                LINKDIN: "li",
                GOOGLE: "go",
                CONSTANT_CONTACT: "cc"
            },

            phone_types: {
                MOBILE: "m",
                HOME: "h",
                WORK: "w"
            },

            activity_types: {
                PHONE: "p",
                EMAIL: "e"
            }
        },

        user: {
            credential_types: {
                LOCAL: "lo",
                FACEBOOK: "fb",
                TWITTER: "tw",
                LINKDIN: "li",
                GOOGLE: "go"
            }
        }
    };

    if (typeof $$ === 'undefined') {
        $$ = {};
    }

    $$.constants = $$.constants || {};
    $$.constants = _.extend($$.constants, constants);

    return $$.constants;
});
