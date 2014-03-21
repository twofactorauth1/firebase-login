/**
 * The Video component.
 *
 * Stores data that supports the display of a single video and optional
 * text.  If text is available, it is either to the right or th left of the video.
 */
require('./model.base');

var component = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            /**
             * The type of component this is
             */
            type: "video_text",

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
             * @see $$.m.cms.modules.VideoText.VIDEO_POSITION
             */
            videoPosition: "",

            /**
             * The caption to accompany the image (optional)
             *
             * {
             *      label: "",              // The caption that appears beneath or aside from the image
             *      description: ""         // The description that appears beneath or aside from the image
             * }
             */
            caption: null,

            /**
             * The optional url of the image
             */
            url: null,

            /**
             * The optional embed code to embed the video (e.g. YouTube embed)
             */
            embed: null
        }
    },


    initialize: function(options) {

    }


}, {

    VIDEO_POSITION: {
        LEFT: "left",
        RIGHT: "right",
        CENTER: "center"
    },


    validate: function() {

    }
});

$$.m.cms = $$.m.cms || {};
$$.m.cms.modules = $$.m.cms.modules || {};
$$.m.cms.modules.VideoText = component;

module.exports = component;
