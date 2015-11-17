/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2015
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
            "ssb" : true,
            "styles" : {
                "headerBackgroundColor" : "#FFFFFF",
                "bodyBackgroundColor" : "#FFFFFF",
                "primaryTextColor" : "#000000",
                "primaryBtnColor" : "#50c7e8",
                "headingSize" : "16px",
                "paragraphSize" : "12px"
            },
            "headingFontStack" : "\"Helvetica Neue\", Helvetica, Arial, sans-serif",
            "paragraphFontStack" : "\"Helvetica Neue\", Helvetica, Arial, sans-serif",
            "defaultSections" : [
                {}
            ],


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
        table: "templates",
        idStrategy: "uuid"
    }
});

$$.m.ssb = $$.m.ssb || {};
$$.m.ssb.Template = template;

module.exports = template;
