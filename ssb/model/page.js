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
             * The sections that make up the page
             * [
             *      array of data from each component
             * ]
             */
            sections: [],

            /**
             * This object will contain page-specific overrides to template styles
             */
            templateOverrides: {},

            /**
             * Which template the page is created from.
             */
            templateId : null,

            /**
             * Check if the page is secure OR not.
             */
            secure:false,

            type:'page',

            /**
             * Version of the page.  Auto incremented.  Cannot be modified externally.
             */
            version:0,
            latest:true,

            /**
             * Status of the page.  Can be either DRAFT or PUBLISHED
             */
            status:'PUBLISHED',

            /**
             * Created by data
             *
             * @property created
             * @type {Object}
             * @default {}
             */
            created: {
                date: new Date(),
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
                date: new Date(),
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
    },

    hasSectionReferences: function() {
        var refsList = _.filter(this.get('sections'), function(section){
            return section.hasOwnProperty('_id') && !section.hasOwnProperty('type');
        });
        return refsList.length > 0;
    },

    hasSectionObjects: function() {
        var objsList = _.filter(this.get('sections'), function(section){
            return section.hasOwnProperty('type');
        });
        return objsList.length > 0;
    },

    transients: {
        deepCopy: true,
        frontend: [
            function (json, options) {
                if(json.created) {
                    delete json.created;
                }
                if(json.modified) {
                    delete json.modified;
                }
                /*
                 _id: "b94904b1-d3b5-4aee-b756-47bdcf48d65a"
                 accountId: 6
                 handle: "Default-ctdsm"
                 latest: true
                 modified: Object
                 sections: Array[1]
                 secure: false
                 seo: null
                 templateId: "11032028"
                 templateOverrides: Object
                 title: null
                 type: "page"
                 version: 0
                 visibility: Object
                 websiteId: "4d45e818-b797-4758-b4d6-0af3378457f4"
                 */
                delete json._id;
                delete json.accountId;
                delete json.latest;
                delete json.secure;
                delete json.seo;
                delete json.templateId;
                delete json.templateOverrides;
                delete json.type;
                delete json.version;
                delete json.visibility;
                delete json.websiteId;
            }
        ]
    }

}, {
    db: {
        storage: "mongo",
        table: "pages",
        idStrategy: "uuid"
    }
});

$$.m.ssb = $$.m.ssb || {};
$$.m.ssb.Page = page;

module.exports = page;
