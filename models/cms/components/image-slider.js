/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

/**
 * The Image slider component.
 *
 * Stores data that supports multiple images, captions, and overlays and eventually
 * are displayed in a slider like comonent, usually for marketing purposes.
 */
require('../../base.model.js');

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
            type: "image-slider",

            /**
             * The label for the component
             * (optional)
             */
            label:"",

            /**
             * A description that appears at the top of the component
             * (optional)
             */
            description:"",

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
            images: []
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
$$.m.cms.modules.ImageSlider = component;

module.exports = component;
