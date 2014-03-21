require('./model.base');

/**
 * @class Page
 */
var page = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            /**
             * The ID property of the Page class instance
             *
             * @property _id
             * @type {String}
             * @defeault ""
             */
            _id: "",

            /**
             * The account Id to whom this page belongs
             *
             * @property accountId
             * @type {Number}
             * @default 0
             */
            accountId:0,

            /**
             * The website Id to whom this page belongs
             *
             * @property websiteId
             * @type {Number}
             * @default 0
             */
            websiteId:0,

            /**
             * The page handle, reserved handle is "index", for the main page
             *
             * @property handle
             * @type {String}
             * @default ""
             */
            handle: "",

            /**
             * The page title that appears in the tab name
             *
             * @property title
             * @type {String}
             * @default ""
             */
            title: "",

            /**
             * Add a little bit of information to help Search engine optimization
             *
             * @property seo
             * @type {Object}
             * @default: "{title: "", metadescription: "", keywords: ""}"
             */
            seo: {
                title: "",
                metadescription: "",
                keywords: ""
            },

            /**
             * Determines if this page is visible or not
             */
            visibility: {
                visible: false, //true | false
                asOf: null,     //Timestamp, tracks the last time the visible flag was modified
                displayOn: null //Timestamp, determines when this page becomes visible.  If null, it's ignored
            },

            /**
             * The modules that make up the page
             * [{
             *  _id,
             *  type,
             *  data: {}        //The data specific for this module type
             * ]}
             */
            modules: [],

            /**
             * Created by data
             *
             * @property created
             * @type {Object}
             * @default {}
             */
            created: {
                date: "",
                by: null,
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

    }

}, {
    db: {
        storage: "mongo",
        table: "pages",
        idStrategy: "uuid"
    }
});

$$.m.cms = $$.m.cms || {};
$$.m.cms.Page = page;

module.exports = page;
