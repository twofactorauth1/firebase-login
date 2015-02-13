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
					CONTACT_CREATED:"CONTACT_CREATED",
					EMAIL: "EMAIL",
					PHONECALL: "PHONECALL",
					FACEBOOK_LIKE: "FACEBOOK_LIKE",
					TWEET: "TWEET",

                   dp: [ {label: "Page View",data:"PAGE_VIEW"},
	                    {label:"Subscribe", data:"SUBSCRIBE"},
	                    {label:"Contact Created", data:"CONTACT_CREATED"},
	                    {label:"Emails", data:"EMAIL"},
	                    {label:"Phone Calls", data:"PHONECALL"},
	                    {label:"Facebook Likes", data:"FACEBOOK_LIKE"},
	                    {label:"Tweets", data:"TWEET"}
                    ]
            },
            business_hour_times: {
                HOURS: ["5:00 am", "6:00 am", "7:00 am", "8:00 am", "9:00 am", "10:00 am", "11:00 am", "12:00 pm", "1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm", "5:00 pm", "6:00 pm", "7:00 pm", "8:00 pm", "9:00 pm", "10:00 pm", "11:00 pm", "12:00 am" ]
            },
            country_codes: [
                      {
                        label: "Afghanistan",
                        data: "AF"
                      },
                      {
                        label: "Åland Islands",
                        data: "AX"
                      },
                      {
                        label: "Albania",
                        data: "AL"
                      },
                      {
                        label: "Algeria",
                        data: "DZ"
                      },
                      {
                        label: "American Samoa",
                        data: "AS"
                      },
                      {
                        label: "Andorra",
                        data: "AD"
                      },
                      {
                        label: "Angola",
                        data: "AO"
                      },
                      {
                        label: "Anguilla",
                        data: "AI"
                      },
                      {
                        label: "Antarctica",
                        data: "AQ"
                      },
                      {
                        label: "Antigua and Barbuda",
                        data: "AG"
                      },
                      {
                        label: "Argentina",
                        data: "AR"
                      },
                      {
                        label: "Armenia",
                        data: "AM"
                      },
                      {
                        label: "Aruba",
                        data: "AW"
                      },
                      {
                        label: "Australia",
                        data: "AU"
                      },
                      {
                        label: "Austria",
                        data: "AT"
                      },
                      {
                        label: "Azerbaijan",
                        data: "AZ"
                      },
                      {
                        label: "Bahamas",
                        data: "BS"
                      },
                      {
                        label: "Bahrain",
                        data: "BH"
                      },
                      {
                        label: "Bangladesh",
                        data: "BD"
                      },
                      {
                        label: "Barbados",
                        data: "BB"
                      },
                      {
                        label: "Belarus",
                        data: "BY"
                      },
                      {
                        label: "Belgium",
                        data: "BE"
                      },
                      {
                        label: "Belize",
                        data: "BZ"
                      },
                      {
                        label: "Benin",
                        data: "BJ"
                      },
                      {
                        label: "Bermuda",
                        data: "BM"
                      },
                      {
                        label: "Bhutan",
                        data: "BT"
                      },
                      {
                        label: "Bolivia, Plurinational State of",
                        data: "BO"
                      },
                      {
                        label: "Bonaire, Sint Eustatius and Saba",
                        data: "BQ"
                      },
                      {
                        label: "Bosnia and Herzegovina",
                        data: "BA"
                      },
                      {
                        label: "Botswana",
                        data: "BW"
                      },
                      {
                        label: "Bouvet Island",
                        data: "BV"
                      },
                      {
                        label: "Brazil",
                        data: "BR"
                      },
                      {
                        label: "British Indian Ocean Territory",
                        data: "IO"
                      },
                      {
                        label: "Brunei Darussalam",
                        data: "BN"
                      },
                      {
                        label: "Bulgaria",
                        data: "BG"
                      },
                      {
                        label: "Burkina Faso",
                        data: "BF"
                      },
                      {
                        label: "Burundi",
                        data: "BI"
                      },
                      {
                        label: "Cambodia",
                        data: "KH"
                      },
                      {
                        label: "Cameroon",
                        data: "CM"
                      },
                      {
                        label: "Canada",
                        data: "CA"
                      },
                      {
                        label: "Cape Verde",
                        data: "CV"
                      },
                      {
                        label: "Cayman Islands",
                        data: "KY"
                      },
                      {
                        label: "Central African Republic",
                        data: "CF"
                      },
                      {
                        label: "Chad",
                        data: "TD"
                      },
                      {
                        label: "Chile",
                        data: "CL"
                      },
                      {
                        label: "China",
                        data: "CN"
                      },
                      {
                        label: "Christmas Island",
                        data: "CX"
                      },
                      {
                        label: "Cocos (Keeling) Islands",
                        data: "CC"
                      },
                      {
                        label: "Colombia",
                        data: "CO"
                      },
                      {
                        label: "Comoros",
                        data: "KM"
                      },
                      {
                        label: "Congo",
                        data: "CG"
                      },
                      {
                        label: "Congo, the Democratic Republic of the",
                        data: "CD"
                      },
                      {
                        label: "Cook Islands",
                        data: "CK"
                      },
                      {
                        label: "Costa Rica",
                        data: "CR"
                      },
                      {
                        label: "Côte d'Ivoire",
                        data: "CI"
                      },
                      {
                        label: "Croatia",
                        data: "HR"
                      },
                      {
                        label: "Cuba",
                        data: "CU"
                      },
                      {
                        label: "Curaçao",
                        data: "CW"
                      },
                      {
                        label: "Cyprus",
                        data: "CY"
                      },
                      {
                        label: "Czech Republic",
                        data: "CZ"
                      },
                      {
                        label: "Denmark",
                        data: "DK"
                      },
                      {
                        label: "Djibouti",
                        data: "DJ"
                      },
                      {
                        label: "Dominica",
                        data: "DM"
                      },
                      {
                        label: "Dominican Republic",
                        data: "DO"
                      },
                      {
                        label: "Ecuador",
                        data: "EC"
                      },
                      {
                        label: "Egypt",
                        data: "EG"
                      },
                      {
                        label: "El Salvador",
                        data: "SV"
                      },
                      {
                        label: "Equatorial Guinea",
                        data: "GQ"
                      },
                      {
                        label: "Eritrea",
                        data: "ER"
                      },
                      {
                        label: "Estonia",
                        data: "EE"
                      },
                      {
                        label: "Ethiopia",
                        data: "ET"
                      },
                      {
                        label: "Falkland Islands (Malvinas)",
                        data: "FK"
                      },
                      {
                        label: "Faroe Islands",
                        data: "FO"
                      },
                      {
                        label: "Fiji",
                        data: "FJ"
                      },
                      {
                        label: "Finland",
                        data: "FI"
                      },
                      {
                        label: "France",
                        data: "FR"
                      },
                      {
                        label: "French Guiana",
                        data: "GF"
                      },
                      {
                        label: "French Polynesia",
                        data: "PF"
                      },
                      {
                        label: "French Southern Territories",
                        data: "TF"
                      },
                      {
                        label: "Gabon",
                        data: "GA"
                      },
                      {
                        label: "Gambia",
                        data: "GM"
                      },
                      {
                        label: "Georgia",
                        data: "GE"
                      },
                      {
                        label: "Germany",
                        data: "DE"
                      },
                      {
                        label: "Ghana",
                        data: "GH"
                      },
                      {
                        label: "Gibraltar",
                        data: "GI"
                      },
                      {
                        label: "Greece",
                        data: "GR"
                      },
                      {
                        label: "Greenland",
                        data: "GL"
                      },
                      {
                        label: "Grenada",
                        data: "GD"
                      },
                      {
                        label: "Guadeloupe",
                        data: "GP"
                      },
                      {
                        label: "Guam",
                        data: "GU"
                      },
                      {
                        label: "Guatemala",
                        data: "GT"
                      },
                      {
                        label: "Guernsey",
                        data: "GG"
                      },
                      {
                        label: "Guinea",
                        data: "GN"
                      },
                      {
                        label: "Guinea-Bissau",
                        data: "GW"
                      },
                      {
                        label: "Guyana",
                        data: "GY"
                      },
                      {
                        label: "Haiti",
                        data: "HT"
                      },
                      {
                        label: "Heard Island and McDonald Mcdonald Islands",
                        data: "HM"
                      },
                      {
                        label: "Holy See (Vatican City State)",
                        data: "VA"
                      },
                      {
                        label: "Honduras",
                        data: "HN"
                      },
                      {
                        label: "Hong Kong",
                        data: "HK"
                      },
                      {
                        label: "Hungary",
                        data: "HU"
                      },
                      {
                        label: "Iceland",
                        data: "IS"
                      },
                      {
                        label: "India",
                        data: "IN"
                      },
                      {
                        label: "Indonesia",
                        data: "ID"
                      },
                      {
                        label: "Iran, Islamic Republic of",
                        data: "IR"
                      },
                      {
                        label: "Iraq",
                        data: "IQ"
                      },
                      {
                        label: "Ireland",
                        data: "IE"
                      },
                      {
                        label: "Isle of Man",
                        data: "IM"
                      },
                      {
                        label: "Israel",
                        data: "IL"
                      },
                      {
                        label: "Italy",
                        data: "IT"
                      },
                      {
                        label: "Jamaica",
                        data: "JM"
                      },
                      {
                        label: "Japan",
                        data: "JP"
                      },
                      {
                        label: "Jersey",
                        data: "JE"
                      },
                      {
                        label: "Jordan",
                        data: "JO"
                      },
                      {
                        label: "Kazakhstan",
                        data: "KZ"
                      },
                      {
                        label: "Kenya",
                        data: "KE"
                      },
                      {
                        label: "Kiribati",
                        data: "KI"
                      },
                      {
                        label: "Korea, Democratic People's Republic of",
                        data: "KP"
                      },
                      {
                        label: "Korea, Republic of",
                        data: "KR"
                      },
                      {
                        label: "Kuwait",
                        data: "KW"
                      },
                      {
                        label: "Kyrgyzstan",
                        data: "KG"
                      },
                      {
                        label: "Lao People's Democratic Republic",
                        data: "LA"
                      },
                      {
                        label: "Latvia",
                        data: "LV"
                      },
                      {
                        label: "Lebanon",
                        data: "LB"
                      },
                      {
                        label: "Lesotho",
                        data: "LS"
                      },
                      {
                        label: "Liberia",
                        data: "LR"
                      },
                      {
                        label: "Libya",
                        data: "LY"
                      },
                      {
                        label: "Liechtenstein",
                        data: "LI"
                      },
                      {
                        label: "Lithuania",
                        data: "LT"
                      },
                      {
                        label: "Luxembourg",
                        data: "LU"
                      },
                      {
                        label: "Macao",
                        data: "MO"
                      },
                      {
                        label: "Macedonia, the Former Yugoslav Republic of",
                        data: "MK"
                      },
                      {
                        label: "Madagascar",
                        data: "MG"
                      },
                      {
                        label: "Malawi",
                        data: "MW"
                      },
                      {
                        label: "Malaysia",
                        data: "MY"
                      },
                      {
                        label: "Maldives",
                        data: "MV"
                      },
                      {
                        label: "Mali",
                        data: "ML"
                      },
                      {
                        label: "Malta",
                        data: "MT"
                      },
                      {
                        label: "Marshall Islands",
                        data: "MH"
                      },
                      {
                        label: "Martinique",
                        data: "MQ"
                      },
                      {
                        label: "Mauritania",
                        data: "MR"
                      },
                      {
                        label: "Mauritius",
                        data: "MU"
                      },
                      {
                        label: "Mayotte",
                        data: "YT"
                      },
                      {
                        label: "Mexico",
                        data: "MX"
                      },
                      {
                        label: "Micronesia, Federated States of",
                        data: "FM"
                      },
                      {
                        label: "Moldova, Republic of",
                        data: "MD"
                      },
                      {
                        label: "Monaco",
                        data: "MC"
                      },
                      {
                        label: "Mongolia",
                        data: "MN"
                      },
                      {
                        label: "Montenegro",
                        data: "ME"
                      },
                      {
                        label: "Montserrat",
                        data: "MS"
                      },
                      {
                        label: "Morocco",
                        data: "MA"
                      },
                      {
                        label: "Mozambique",
                        data: "MZ"
                      },
                      {
                        label: "Myanmar",
                        data: "MM"
                      },
                      {
                        label: "Namibia",
                        data: "NA"
                      },
                      {
                        label: "Nauru",
                        data: "NR"
                      },
                      {
                        label: "Nepal",
                        data: "NP"
                      },
                      {
                        label: "Netherlands",
                        data: "NL"
                      },
                      {
                        label: "New Caledonia",
                        data: "NC"
                      },
                      {
                        label: "New Zealand",
                        data: "NZ"
                      },
                      {
                        label: "Nicaragua",
                        data: "NI"
                      },
                      {
                        label: "Niger",
                        data: "NE"
                      },
                      {
                        label: "Nigeria",
                        data: "NG"
                      },
                      {
                        label: "Niue",
                        data: "NU"
                      },
                      {
                        label: "Norfolk Island",
                        data: "NF"
                      },
                      {
                        label: "Northern Mariana Islands",
                        data: "MP"
                      },
                      {
                        label: "Norway",
                        data: "NO"
                      },
                      {
                        label: "Oman",
                        data: "OM"
                      },
                      {
                        label: "Pakistan",
                        data: "PK"
                      },
                      {
                        label: "Palau",
                        data: "PW"
                      },
                      {
                        label: "Palestine, State of",
                        data: "PS"
                      },
                      {
                        label: "Panama",
                        data: "PA"
                      },
                      {
                        label: "Papua New Guinea",
                        data: "PG"
                      },
                      {
                        label: "Paraguay",
                        data: "PY"
                      },
                      {
                        label: "Peru",
                        data: "PE"
                      },
                      {
                        label: "Philippines",
                        data: "PH"
                      },
                      {
                        label: "Pitcairn",
                        data: "PN"
                      },
                      {
                        label: "Poland",
                        data: "PL"
                      },
                      {
                        label: "Portugal",
                        data: "PT"
                      },
                      {
                        label: "Puerto Rico",
                        data: "PR"
                      },
                      {
                        label: "Qatar",
                        data: "QA"
                      },
                      {
                        label: "Réunion",
                        data: "RE"
                      },
                      {
                        label: "Romania",
                        data: "RO"
                      },
                      {
                        label: "Russian Federation",
                        data: "RU"
                      },
                      {
                        label: "Rwanda",
                        data: "RW"
                      },
                      {
                        label: "Saint Barthélemy",
                        data: "BL"
                      },
                      {
                        label: "Saint Helena, Ascension and Tristan da Cunha",
                        data: "SH"
                      },
                      {
                        label: "Saint Kitts and Nevis",
                        data: "KN"
                      },
                      {
                        label: "Saint Lucia",
                        data: "LC"
                      },
                      {
                        label: "Saint Martin (French part)",
                        data: "MF"
                      },
                      {
                        label: "Saint Pierre and Miquelon",
                        data: "PM"
                      },
                      {
                        label: "Saint Vincent and the Grenadines",
                        data: "VC"
                      },
                      {
                        label: "Samoa",
                        data: "WS"
                      },
                      {
                        label: "San Marino",
                        data: "SM"
                      },
                      {
                        label: "Sao Tome and Principe",
                        data: "ST"
                      },
                      {
                        label: "Saudi Arabia",
                        data: "SA"
                      },
                      {
                        label: "Senegal",
                        data: "SN"
                      },
                      {
                        label: "Serbia",
                        data: "RS"
                      },
                      {
                        label: "Seychelles",
                        data: "SC"
                      },
                      {
                        label: "Sierra Leone",
                        data: "SL"
                      },
                      {
                        label: "Singapore",
                        data: "SG"
                      },
                      {
                        label: "Sint Maarten (Dutch part)",
                        data: "SX"
                      },
                      {
                        label: "Slovakia",
                        data: "SK"
                      },
                      {
                        label: "Slovenia",
                        data: "SI"
                      },
                      {
                        label: "Solomon Islands",
                        data: "SB"
                      },
                      {
                        label: "Somalia",
                        data: "SO"
                      },
                      {
                        label: "South Africa",
                        data: "ZA"
                      },
                      {
                        label: "South Georgia and the South Sandwich Islands",
                        data: "GS"
                      },
                      {
                        label: "South Sudan",
                        data: "SS"
                      },
                      {
                        label: "Spain",
                        data: "ES"
                      },
                      {
                        label: "Sri Lanka",
                        data: "LK"
                      },
                      {
                        label: "Sudan",
                        data: "SD"
                      },
                      {
                        label: "Suriname",
                        data: "SR"
                      },
                      {
                        label: "Svalbard and Jan Mayen",
                        data: "SJ"
                      },
                      {
                        label: "Swaziland",
                        data: "SZ"
                      },
                      {
                        label: "Sweden",
                        data: "SE"
                      },
                      {
                        label: "Switzerland",
                        data: "CH"
                      },
                      {
                        label: "Syrian Arab Republic",
                        data: "SY"
                      },
                      {
                        label: "Taiwan, Province of China",
                        data: "TW"
                      },
                      {
                        label: "Tajikistan",
                        data: "TJ"
                      },
                      {
                        label: "Tanzania, United Republic of",
                        data: "TZ"
                      },
                      {
                        label: "Thailand",
                        data: "TH"
                      },
                      {
                        label: "Timor-Leste",
                        data: "TL"
                      },
                      {
                        label: "Togo",
                        data: "TG"
                      },
                      {
                        label: "Tokelau",
                        data: "TK"
                      },
                      {
                        label: "Tonga",
                        data: "TO"
                      },
                      {
                        label: "Trinidad and Tobago",
                        data: "TT"
                      },
                      {
                        label: "Tunisia",
                        data: "TN"
                      },
                      {
                        label: "Turkey",
                        data: "TR"
                      },
                      {
                        label: "Turkmenistan",
                        data: "TM"
                      },
                      {
                        label: "Turks and Caicos Islands",
                        data: "TC"
                      },
                      {
                        label: "Tuvalu",
                        data: "TV"
                      },
                      {
                        label: "Uganda",
                        data: "UG"
                      },
                      {
                        label: "Ukraine",
                        data: "UA"
                      },
                      {
                        label: "United Arab Emirates",
                        data: "AE"
                      },
                      {
                        label: "United Kingdom",
                        data: "GB"
                      },
                      {
                        label: "United States",
                        data: "US"
                      },
                      {
                        label: "United States Minor Outlying Islands",
                        data: "UM"
                      },
                      {
                        label: "Uruguay",
                        data: "UY"
                      },
                      {
                        label: "Uzbekistan",
                        data: "UZ"
                      },
                      {
                        label: "Vanuatu",
                        data: "VU"
                      },
                      {
                        label: "Venezuela, Bolivarian Republic of",
                        data: "VE"
                      },
                      {
                        label: "Viet Nam",
                        data: "VN"
                      },
                      {
                        label: "Virgin Islands, British",
                        data: "VG"
                      },
                      {
                        label: "Virgin Islands, U.S.",
                        data: "VI"
                      },
                      {
                        label: "Wallis and Futuna",
                        data: "WF"
                      },
                      {
                        label: "Western Sahara",
                        data: "EH"
                      },
                      {
                        label: "Yemen",
                        data: "YE"
                      },
                      {
                        label: "Zambia",
                        data: "ZM"
                      },
                      {
                        label: "Zimbabwe",
                        data: "ZW"
                      }
                    ]
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
        },
        
        googleApiKey : 'AIzaSyCQyG-ND5NsItTzZ0m_t1CYPLylcw2ZszQ'
    };

    if (typeof $$ === 'undefined') {
        $$ = {};
    }

    $$.constants = $$.constants || {};
    $$.constants = _.extend($$.constants, constants);

    return $$.constants;
});
