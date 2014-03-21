/**
 * The Image slider component.
 *
 * Stores data that supports multiple images, captions, and overlays and eventually
 * are displayed in a slider like comonent, usually for marketing purposes.
 */
require('./model.base');

var component = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            /**
             * The type of component this is
             */
            type: "image_slider",

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
             *      overlay: {
             *          label: "",              //label overlay, positioned atop the image in the center
             *          description:""          //description overlay, positioned beneath the label
             *      },
             *
             *      caption: {
             *          label: ""               //The caption that appears beneath or aside from the image
             *          descpription: ""        //The description that appears beneath or aside from the image
             *      }
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
