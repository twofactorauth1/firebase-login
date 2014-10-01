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
                ENTERPRISE: 3,
                dp: [
                    {label: "Professional", data: "1"},
                    {label: "Business", data: "2"},
                    {label: "Enterprise", data: "3"}
                ]
            },

            company_size: {
                SINGLE: 1,
                SMALL: 2,
                MEDIUM: 3,
                LARGE: 4,
                ENTERPRISE: 5,
                dp: [
                    {label: "Single", data: "1"},
                    {label: "Small", data: "2"},
                    {label: "Medium", data: "3"},
                    {label: "Large", data: "4"},
                    {label: "Enterprise", data: "5"}
                ]
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
                LEAD: 'ld',
                OTHER: "ot",

                dp: [
                    {label: "Customer", data: "cu"},
                    {label: "Colleague", data: "co"},
                    {label: "Friend", data: "fr"},
                    {label: "Member", data: "mb"},
                    {label: "Family", data: "fa"},
                    {label: "Admin", data: "ad"},
                    {label: 'Lead', data: 'ld'},
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
            },

            customer_activity_types: {
					PAGE_VIEW: "PAGE_VIEW",
					SUBSCRIBE: "SUBSCRIBE",
					ACCOUNT_CREATED:"ACCOUNT_CREATED",
					EMAIL: "EMAIL",
					PHONECALL: "PHONECALL",
					FACEBOOK_LIKE: "FACEBOOK_LIKE",
					TWEET: "TWEET",

                   dp: [ {label: "Page View",data:"PAGE_VIEW"},
	                    {label:"Subscribe", data:"SUBSCRIBE"},
	                    {label:"Account Created", data:"ACCOUNT_CREATED"},
	                    {label:"Emails", data:"EMAIL"},
	                    {label:"Phone Calls", data:"PHONECALL"},
	                    {label:"Facebook Likes", data:"FACEBOOK_LIKE"},
	                    {label:"Tweets", data:"TWEET"}
                    ]
            }
        },

        user: {
            credential_types: {
                LOCAL: _socialTypes.LOCAL,
                FACEBOOK: _socialTypes.FACEBOOK,
                TWITTER: _socialTypes.TWITTER,
                LINKEDIN: _socialTypes.LINKEDIN,
                GOOGLE: _socialTypes.GOOGLE
            },

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
                LEAD: 'ld',
                OTHER: "ot",

                dp: [
                    {label: "Customer", data: "cu"},
                    {label: "Colleague", data: "co"},
                    {label: "Friend", data: "fr"},
                    {label: "Member", data: "mb"},
                    {label: "Family", data: "fa"},
                    {label: "Admin", data: "ad"},
                    {label: 'Lead', data: 'ld'},
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

        known_file_types: {
            IMAGE: [ "png", "jpg", "jpeg"],
            DOCUMENT: [ "doc", "txt"],
            VIDEO: [ "mp4" ],
            AUDIO: [ "mp3" ]
        }
    };

    if (typeof $$ === 'undefined') {
        $$ = {};
    }

    $$.constants = $$.constants || {};
    $$.constants = _.extend($$.constants, constants);

    return $$.constants;
});
