/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

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
             * @defeault null
             */
            _id: null,

            /**
             * The account Id to whom this page belongs
             *
             * @property accountId
             * @type {Number}
             * @default 0
             */
            accountId:null,

            /**
             * The website Id to whom this page belongs
             *
             * @property websiteId
             * @type {Number}
             * @default 0
             */
            websiteId:null,

            /**
             * The page handle, reserved handle is "index", for the main page
             *
             * @property handle
             * @type {String}
             * @default ""
             */
            handle: null,

            /**
             * The page title that appears in the tab name
             *
             * @property title
             * @type {String}
             * @default ""
             */
            title: null,

            /**
             * Add a little bit of information to help Search engine optimization.
             * Overrides the seo options at the Website level
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
            seo: null,

            /**
             * Determines if this page is visible or not
             */
            visibility: {
                visible: true, //true | false
                asOf: null,     //Timestamp, tracks the last time the visible flag was modified
                displayOn: null //Timestamp, determines when this page becomes visible.  If null, it's ignored
            },

            /**
             * The components that make up the page
             * [
             *      array of data from each component
             * ]
             */
            components: [],

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


    isVisible: function() {
        var visibility = this.get("visibility");
        if (visibility.visible == true) {
            return true;
        }

        return (visibility.displayOn != null && visibility.displayOn < new Date().getTime());
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
