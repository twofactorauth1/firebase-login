/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([], function () {

    var _socialTypes = {
        LOCAL: "lo",
        FACEBOOK: "fb",
        TWITTER: "tw",
        LINKEDIN: "li",
        GOOGLE: "go",
        FULL_CONTACT: "fc",

        dp: [
            {label:"Local", data:"lo"},
            {label:"Facebook", data:"fb"},
            {label:"Twitter", data:"tw"},
            {label:"LinkedIn", data:"li"},
            {label:"Google+", data:"go"}
            //{label:"Full Contacnt", data:"fc"}
        ]
    };


    var constants = {
        server_props: {
            USER_ID: "userId",
            ACCOUNT_ID: "accountId",
            ROUTER: "router",
            ROOT: "root",
            IS_LOGGED_IN: "isLoggedIn"
        },


        social: {
            types: {
                LOCAL: _socialTypes.LOCAL,
                FACEBOOK: _socialTypes.FACEBOOK,
                TWITTER: _socialTypes.TWITTER,
                LINKEDIN: _socialTypes.LINKEDIN,
                GOOGLE: _socialTypes.GOOGLE,
                FULL_CONTACT: _socialTypes.FULL_CONTACT,
                dp:_socialTypes.dp
            }
        },


        email_sources: {
            CONTEXTIO: "ctxtio"
        },


        account: {
            company_types: {
                PROFESSIONAL: 1,
                BUSINESS: 2,
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
                LOCAL: _socialTypes.LOCAL,
                FACEBOOK: _socialTypes.FACEBOOK,
                TWITTER: _socialTypes.TWITTER,
                LINKEDIN: _socialTypes.LINKEDIN,
                GOOGLE: _socialTypes.GOOGLE,
                FULL_CONTACT: _socialTypes.FULL_CONTACT
            },

            contact_types: {
                CUSTOMER: "cu",
                COLLEAGUE: "co",
                FRIEND: "fr",
                MEMBER: "mb",
                FAMILY: "fa",
                ADMIN: "ad",
                OTHER: "ot",

                dp: [
                    {label: "Customer", data: "cu"},
                    {label: "Colleague", data: "co"},
                    {label: "Friend", data: "fr"},
                    {label: "Member", data: "mb"},
                    {label: "Family", data: "fa"},
                    {label: "Admin", data: "ad"},
                    {label: "Other", data: "ot"}
                ]
            },

            phone_types: {
                MOBILE: "m",
                HOME: "h",
                WORK: "w",

                dp: [
                    {label:"mobile", data:"m"},
                    {label:"home", data:"h"},
                    {label:"work", data:"w"}
                ]
            },

            device_types: {
                scale: "2net_scale",
                HOME: "h",
                WORK: "w",

                dp: [
                    {label:"2net_scale", data:"2net_scale"},
                    {label:"home", data:"h"},
                    {label:"work", data:"w"}
                ]
            },

            activity_types: {
                PHONE: "p",
                EMAIL: "e"
            }
        },

        user: {
            credential_types: {
                LOCAL: _socialTypes.LOCAL,
                FACEBOOK: _socialTypes.FACEBOOK,
                TWITTER: _socialTypes.TWITTER,
                LINKEDIN: _socialTypes.LINKEDIN,
                GOOGLE: _socialTypes.GOOGLE
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
