/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

require('./model.base');
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
        idStrategy: "increment"
    }
});

$$.m.Account = account;

module.exports = account;
