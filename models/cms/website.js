require('../model.base');

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
             * @default "0"
             */
            accountId:0,

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
             *          type:       // page | product | collection | home | url
             *          handle:     // The handle of the page that is being linked to. Combined with the type, we can generate URL
             *          pageId:     // The _id of the page being linked to.  Redundant with handle
             *          url:        // The url being linked to, in the case of a URL link
             *      }
             *  }]
             * }]
             */
            linkLists: [],


            /**
             * The header object that will appear on every page.
             *
             * @property header
             * @type {Object}
             * @default null
             */
            header: {
                label: "",
                description: "",
                logo: null,
                image: null,
                linkList1Id: null,
                linkList2Id: null
            },


            /**
             * The footer object that will appear on every page
             *
             * @property footer
             * @type {Object}
             * @default {}
             */
            footer: {
                type: "thin",       // thin | fat

                /**
                 * Properties relevant to a thin footer
                 *
                 * {
                 *      textLeft:"",
                 *      textCenter: "",
                 *      textRight: ""
                 * }
                 */
                thin: null,

                /**
                 * Properties relevant to a fat footer
                 *
                 * {
                 *  blocks: [
                 *      type: "",           // text | email_signup | social_links | tweets | blog
                 *      text: "",           // The text to display if this is a 'text' block
                 *      links: [{
                 *          type: ""        // facebook | twiter | linkedin | google+ | flickr | pinterest | etc
                 *          url
                 *      }],
                 *      blog: {
                 *          label: "",      // The label or name of the blog
                 *          url: ""         // The URL to the RSS feed of the blog
                 *      },
                 *      twitter: {
                 *          username: ""    // The username of the twitter acct to display feeds for
                 *      }
                 *  ]
                 * }
                 */
                fat: null
            },

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

$$.m.cms = $$.m.cms || {};
$$.m.cms.Website = website;

module.exports = website;
