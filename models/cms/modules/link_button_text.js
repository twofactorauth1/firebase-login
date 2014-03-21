/**
 * The Image component.
 *
 * Stores data that supports the display of a single image and optional
 * text.  If text is available, it is either to the right or th left of the video.
 */
require('./model.base');

var component = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            /**
             * The type of component this is
             */
            type: "link_button_text",

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
             * The position of the image relative to the text, left, right, center, none
             *
             * @see $$.m.cms.modules.LinkButtonText.BUTTON_POSITION
             */
            buttonPosition: "",

            /**
             * The label on the button
             */
            buttonLabel: "",

            /**
             * The url the button links to
             */
            url: ""
        }
    },


    initialize: function(options) {

    }


}, {

    BUTTON_POSITION: {
        LEFT: "left",
        RIGHT: "right",
        CENTER: "center"
    },


    validate: function() {

    }
});

$$.m.cms = $$.m.cms || {};
$$.m.cms.modules = $$.m.cms.modules || {};
$$.m.cms.modules.LinkButtonText = component;

module.exports = component;
