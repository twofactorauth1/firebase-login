/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Feature List components
 *
 * Stores data that represents a feature list for a product
 * or service
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
            type: "feature-list",

            /**
             * Version
             */
            version: 2,

            /**
             *
             *
             */
            title: '<div style="text-align: center;"><span style="font-size: 24px;"><strong><em>FEATURE LIST</em></strong></span><span style="font-size: 14px;"></span></div>',


            /**
             * An array of features of the form
             * [{
             *      label: "",              //The label to display beneath the icon
             *      description: "",        //The description to display beneath the elabel
             *      url: null               //The URL of the icon / image
             *      iconClass: null         //The classname of the icon to display
             * ]}
             *
             *  - Note: the above data model doesn't seem to apply anymore - Jack
             */
            features: [
                {
                    "top" : "<div style='text-align:center'><span class=\"fa fa-arrow-right\" style=\"color:#ffffff;font-size:96px;\">&zwnj;</span></div>",
                    "content" : "<div style=\"text-align: center;\"><br><span style=\"font-size:24px;\">Feature Title</span></div><div style=\"text-align: center;\"><br>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</div><div style=\"text-align: center;\"><br><a class=\"btn ssb-theme-btn\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></div>"
                },
                {
                    "top" : "<div style='text-align:center'><span class=\"fa fa-arrow-right\" style=\"color:#ffffff;font-size:96px;\">&zwnj;</span></div>",
                    "content" : "<div style=\"text-align: center;\"><br><span style=\"font-size:24px;\">Feature Title</span></div><div style=\"text-align: center;\"><br>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</div><div style=\"text-align: center;\"><br><a class=\"btn ssb-theme-btn\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></div>"
                },
                {
                    "top" : "<div style='text-align:center'><span class=\"fa fa-arrow-right\" style=\"color:#ffffff;font-size:96px;\">&zwnj;</span></div>",
                    "content" : "<div style=\"text-align: center;\"><br><span style=\"font-size:24px;\">Feature Title</span></div><div style=\"text-align: center;\"><br>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</div><div style=\"text-align: center;\"><br><a class=\"btn ssb-theme-btn\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></div>"
                }
            ],

            /**
             *
             *
             */
            txtcolor : "",

            /**
             *
             *
             */
            bg: {
                img : {
                    // url : "http://s3.amazonaws.com/indigenous-digital-assets/account_6/water-bg_1422229101229.jpg",
                    url: '',
                    width : null,
                    height : null,
                    parallax : false,
                    blur : false,
                    overlay: true,
                    show: true
                },
                color : ""
            },
            blockbgcolor: "#6c7a89",

            /**
             *
             *
             */
            visibility: true
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
$$.m.cms.modules.FeatureList = component;

module.exports = component;
