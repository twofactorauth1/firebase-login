/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2016
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

require('../../models/base.model.js');

var template = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            /**
             * The Id of this instance,
             *
             * @property _id
             * @type {Guid}
             * @default ""
             */
            _id: "",
            "name" : "Default",
            "accountId" : 6,
            "public" : true,
            "description": "",

            /*
             * Preview Image
             *
             * @property previewUrl
             * @type {String}
             * @default ""
             *
             */
            "previewUrl": "",

            /*
             * Default pages
             * - created on user selection of site template
             * @property defaultPageTemplates
             * @type {Array}
             *
             *    ex:
             *        [{
             *            "type": "template",
             *            "pageTemplateId": "1103202892929",
             *            "pageHandle": "index",
             *            "pageTitle": "Home"
             *        }]
             *
             * @default []
             */
            "defaultPageTemplates": [],

            /*
             * Default Theme
             *
             * @property defaultTheme
             * @type {String}
             * @default "default"
             */
            "defaultTheme": "default",

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
                date: null,
                by: null
            }
        }
    },

    serializers: {

    },


    initialize: function(options) {

    },


    validate: function() {
        return true;
    }

}, {
    db: {
        storage: "mongo",
        table: "sitetemplates",
        idStrategy: "uuid"
    }
});

$$.m.ssb = $$.m.ssb || {};
$$.m.ssb.SiteTemplate = template;

module.exports = template;
