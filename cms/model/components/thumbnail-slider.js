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
            type: "thumbnail-slider",

            /**
             * The label for the component
             * (optional)
             */
            title:"",

            /**
             * A description that appears at the top of the component
             * (optional)
             */
            subtitle:"",

            /**
             * An array of objects that contain image and caption data:
             * [{
             *      label:"",                   //The caption that appears beneath or aside from the image
             *      description:""              //The description that appears beneath or aside from the image
             *      overlayLabel:"",            //label overlay, positioned atop the image in the center
             *      overlayDescription:""       //description overlay, positioned beneath the label
             *      url:                        //The url of the image
             * }]
             */
            imagetextcolor : green,
            indicatorcolor : #3276bb,
            images : [
                {
                    text : "Thumbnail Image",
                    url : "https://s3.amazonaws.com/indigenous-digital-assets/account_114/or-st_logo_horizontal_hi_res_1417334410262.png",
                    width : 250,
                    height : 175,
                    margin : "40px auto 0"
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
$$.m.cms.modules.ThumbnailSlider = component;

module.exports = component;
