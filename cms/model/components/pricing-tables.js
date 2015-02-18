/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Image slider component.
 *
 * Stores data that supports multiple images, captions, and overlays and eventually
 * are displayed in a slider like comonent, usually for marketing purposes.
 */
require('../../../models/base.model.js');

var component = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            /**
             * The ID of this copmonent
             */
            _id: null,

            /**
             * Some themes may use this anchor to create
             * navigation directly to thise component
             */
            anchor: null,

            /**
             * The type of component this is
             */
            type: "pricing-tables",

            /**
             * The label for the component
             * (optional)
             */
            title:"<h1>Pricing Table</h1>",            

            txtcolor: "#444",
            tblbgcolor: null,
            tables : [
                {
                    title : "<h1>This is title</h1>",
                    subtitle : "<h3>This is the subtitle.</h3>",
                    text : 'This is text',
                    price : '$9.99/per month',
                    features: [
                        {
                            title : "<h4>This is the feature title</h4>",
                            subtitle : "<b>This is the feature subtitle</b>",
                        }
                    ],
                    btn : "<a class=\"btn btn-primary\" href=\"#\" data-cke-saved-href=\"#\">Get it now</a>"
                }
            ]
        }
    },


    initialize: function(options) {

    }


}, {

    validate: function() {

    }
});

$$.m.cms = $$.m.cms || {};
$$.m.cms.modules = $$.m.cms.modules || {};
$$.m.cms.modules.PricingTables = component;

module.exports = component;
