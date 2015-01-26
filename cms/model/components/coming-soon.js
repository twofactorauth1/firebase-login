/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Contact Us Component
 *
 * Stores data that represents information required
 * to dispaly Contact Us information
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
            type: "coming-soon",

            /**
             * The version of the component
             *
             */
            version: 1,

            /**
             *
             *
             */
            txtcolor: "#ffffff",

            /**
             *
             *
             */
            title : "<p style=\"text-align: center;\"><span style=\"font-size:48px;\">Coming Soon</span></p>",

            /**
             *
             *
             */
            text : "<p><span style=\"font-size:18px;\">This site will be launching shortly.</span></p>",

            /**
             *
             *
             */
            txtcolor : "#ffffff",

            /**
             *
             *
             */
            logo : "<p>&nbsp;</p><div tabindex=\"-1\" contenteditable=\"false\" data-cke-widget-wrapper=\"1\" data-cke-filter=\"off\" class=\"cke_widget_wrapper cke_widget_block cke_image_nocaption cke_widget_focused cke_widget_selected\" data-cke-display-name=\"image\" data-cke-widget-id=\"2\"><p data-cke-widget-keep-attr=\"0\" data-widget=\"image\" class=\"cke_widget_element\" data-cke-widget-data=\"%7B%22hasCaption%22%3Afalse%2C%22src%22%3A%22%2F%2Fs3.amazonaws.com%2Findigenous-digital-assets%2Faccount_6%2Frocket-icon-512x512_1421971689163.png%22%2C%22alt%22%3A%22%22%2C%22width%22%3A217%2C%22height%22%3A217%2C%22lock%22%3Atrue%2C%22align%22%3A%22center%22%2C%22classes%22%3Anull%7D\" style=\"text-align: center;\"><span class=\"cke_image_resizer_wrapper\"><img data-cke-saved-src=\"//s3.amazonaws.com/indigenous-digital-assets/account_6/rocket-icon-512x512_1421971689163.png\" src=\"//s3.amazonaws.com/indigenous-digital-assets/account_6/rocket-icon-512x512_1421971689163.png\" data-cke-widget-upcasted=\"1\" alt=\"\" width=\"217\" height=\"217\"><span class=\"cke_image_resizer\" title=\"Click and drag to resize\">​</span></span></p></div><p><br></p><div data-cke-hidden-sel=\"1\" data-cke-temp=\"1\" style=\"position:fixed;top:0;left:-1000px\"><br></div><div data-cke-hidden-sel=\"1\" data-cke-temp=\"1\" style=\"position:fixed;top:0;left:-1000px\"><br></div><div data-cke-hidden-sel=\"1\" data-cke-temp=\"1\" style=\"position:fixed;top:0;left:-1000px\">&nbsp;</div>",

            /**
             *
             *
             */
            bg: {
                img : {
                    url : "//s3.amazonaws.com/indigenous-digital-assets/account_6/clouds-bg_1422163412860.jpg",
                    width : null,
                    height : null,
                    parallax : false,
                    blur : false,
                    overlay: false,
                    show: true
                },
                color : "#4bb0cb"
            }
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
$$.m.cms.modules.ComingSoon = component;

module.exports = component;
