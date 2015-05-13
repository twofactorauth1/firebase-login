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
                    btn : "<a style=\"-moz-box-shadow: 3px 4px 0px 0px #1564ad;-webkit-box-shadow: 3px 4px 0px 0px #1564ad;box-shadow: 3px 4px 0px 0px #1564ad;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #79bbff), color-stop(1, #378de5));background:-moz-linear-gradient(top, #79bbff 5%, #378de5 100%);background:-webkit-linear-gradient(top, #79bbff 5%, #378de5 100%);background:-o-linear-gradient(top, #79bbff 5%, #378de5 100%);background:-ms-linear-gradient(top, #79bbff 5%, #378de5 100%);background:linear-gradient(to bottom, #79bbff 5%, #378de5 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#79bbff', endColorstr='#378de5',GradientType=0);background-color:#79bbff;-moz-border-radius:5px;-webkit-border-radius:5px;border-radius:5px;border:1px solid #337bc4;display:inline-block;color:#ffffff;font-family:arial;font-size:17px;font-weight:bold;font-style:normal;padding:12px 44px;text-decoration:none;text-shadow:0px 1px 0px #528ecc;\" href=\"http://\">Get it now</a>"
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
