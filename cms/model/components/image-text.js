/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Image component.
 *
 * Stores data that supports the display of a single image and optional
 * text.  If text is available, it is either to the right or th left of the video.
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
            type: "image-text",

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
             * The html formatted text to display, if applicable
             */
            text: null,

            /**
             * The position of the image relative to the text, left, right, center
             *
             * @see $$.m.cms.modules.ImageText.IMAGE_POSITION
             */
            imagePosition: "",

            /**
             * The caption to accompany the image (optional)
             */
            caption: null,

            /**
             * The url of the image
             */
            url: "",
            title:""
        }
    },


    initialize: function(options) {

    }


}, {

    IMAGE_POSITION: {
        LEFT: "left",
        RIGHT: "right",
        CENTER: "center"
    },


    validate: function() {

    }
});

$$.m.cms = $$.m.cms || {};
$$.m.cms.modules = $$.m.cms.modules || {};
$$.m.cms.modules.ImageText = component;

module.exports = component;
