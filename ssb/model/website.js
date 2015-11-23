/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');
var cryptoUtil = require('../../utils/security/crypto');

var website = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            /**
             * The Id of this website instance,
             *
             * @property _id
             * @type {Guid}
             * @default ""
             */
            _id: "",


            /**
             * The account Id to whom this website belongs
             *
             * @property accountId
             * @type {Number}
             * @default null
             */
            accountId: null,


            /**
             * The settings for this website.  This overrides any similar settings stored
             * at the Account level
             *
             * @type {Object}
             * @default null
             *
             * @example
             * {
             *      title: "My Website Title",
             *      bannerImage: {url}
             *      bannerClickUrl: {url}
             *      logoImage: {url}
             *      logoClickUrl: {url}
             *      backgroundImage: {url}
             * }
             */
            settings: {
                footerlink : true
            },


            /**
             * The Title.  This works as a default title for any page that does not have a
             * title.
             *
             * @type {String}
             * @default: null
             */
            title: "Default Website Title",


            /**
             * Add a little bit of information to help Search engine optimization.
             * This is the default, but can be overridden on a per page basis
             *
             * @property seo
             * @type {Object}
             * @default: null
             *
             * @example:
             * {
             *      title: "my title",
             *      description: "This website is all about xyz",
             *      keywords: "xyz, testing, cool"
             * }
             */
            seo: {},


            /**
             * All of the various link lists associated with this website
             *
             * @property linkLists
             * @type {Array}
             * @default []
             *
             * @example
             *
             * [{
             *  _id,
             *  name:"",            // Reserved are: 'Main Menu', 'Head Menu'
             *  handle:"",          // Reserved are: 'main-menu', 'head-menu'
             *  links: [{
             *      label:""
             *      type:""         // link | menu
             *      linkTo: {
             *          type:       // section | page | product | collection | home | url
             *          data:       // This will be the anchor (section), handle (page, product, collection), or URL (url)
             *      }
             *  }]
             * }]
             */
            linkLists: null,



            footer: null,

            themeId: null,

            themeOverrides:{},

            ssb:true,

            nav_version: 2,


            /**
             * Created by data
             *
             * @property created
             * @type {Object}
             * @default {}
             */
            created: {
                date: "",
                by: null
            },


            /**
             * Modified by data
             *
             * @property modified
             * @type {Object}
             * @default {}
             */
            modified: {
                date: "",
                by: null
            }
        }
    },

    serializers: {
        public: function(json) {
            cryptoUtil.signDocument(json, {accountId: json.accountId, websiteId: json.websiteId});
        },

        db: function(json) {
            delete json.__signature;
        }
    },


    initialize: function(options) {

    },


    validate: function() {
        return true;
    }

}, {
    db: {
        storage: "mongo",
        table: "websites",
        idStrategy: "uuid"
    }
});

$$.m.ssb = $$.m.ssb || {};
$$.m.ssb.Website = website;

module.exports = website;
