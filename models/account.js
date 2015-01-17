/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('./base.model.js');
var appConfig = require('../configs/app.config');

var account = $$.m.ModelBase.extend({

    defaults: function() {
        return {
            _id: null,

            company: {
                name:"",
                type:0,
                size:0,
                logo:""
            },

            subdomain:"",
            domain:"",
            token:"",

            website: {

                /**
                 * The global settings for websites on this account.
                 * This may be overridden at the Website level
                 *
                 * @type {Object}
                 * @default null
                 *
                 * @example
                 * {
                 *      logoImage: {url}
                 *      logoClickUrl: {url}
                 *      favicon: null
                 * }
                 */
                settings: null,
                websiteId:null,             //The current Inidenous template being used, defaults to "default"
                themeId:"default"           //The current template data id being referenced (may have more than one)
            },
            "business" : {
                "logo" : '',
                "name" : '',
                "description" : '',
                "category" : '',
                "size" : '',
                "phones" : [],
                "addresses" : [],
                "type" :'',
                "nonProfit" : false
            },

            "billing" : {
                "userId" : '', //logged in user that added Stripe details
                "customerId": '', //Stripe customerId... also stored on User
                "cardToken": '' //optional. Not sure if we need this if we have the customer reference
            },

            _v:"0.1"
        }
    },


    getOrGenerateSubdomain: function() {
        var subdomain = this.get("subdomain");
        if ($$.u.stringutils.isNullOrEmpty(subdomain)) {
            var companyName = this.get("company").name;
            if ($$.u.stringutils.isNullOrEmpty(companyName) == false) {
                subdomain = companyName.trim().replace(" ", "");
            } else {
                subdomain = "indig-" + Math.round(Math.random() * 1000000);
            }
        }

        return subdomain;
    },


    serializers: {
        public: function(json) {
            if (this.get("subdomain") != null) {
                json.accountUrl = appConfig.getServerUrl(this.get("subdomain"), this.get("domain"));
            }
        },
        db: function(json) {
            if(!String.isNullOrEmpty(json.subdomain)) {
                json.subdomain = json.subdomain.toLowerCase();
            }
        }
    },


    initialize: function(options) {
        if ($$.u.stringutils.isNullOrEmpty(this.get("token"))) {
            var token = $$.u.idutils.generateUUID();
            this.set({token:token});
        }

        if ($$.u.stringutils.isNullOrEmpty(this.get("subdomain"))) {
            var subdomain = this.get("subdomain");
            subdomain = subdomain.trim().replace(" ", "");
            this.set({subdomain:subdomain});
        }
    }


}, {
    db: {
        storage: "mongo",
        table: "accounts",
        idStrategy: "increment",
        cache: true
    }
});

$$.m.Account = account;

module.exports = account;
