/**
 * The Image Gallery component.
 *
 * Stores data that supports a list of images or a data source of images
 * to be displayed in a tiled fashion
 */
require('./model.base');

var component = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            /**
             * The type of component this is
             */
            type: "image_gallery",

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
             * The image size of the images to display:
             *
             * @see $$.m.cms.modules.ImageGallery.IMAGE_SIZES
             */
            imageSize: "medium",

            /**
             * The source of a data feed, such as a flickr set
             *
             * {
             *      url: "",                    // The URL to the data source
             *      type: "",                   // The type of data source, so we know how to parse the images.
             * }
             *
             * @see $$.m.cms.modules.ImageGallery.IMAGE_SOURCES
             */
            source: null,

            /**
             * An array of objects that contain image and caption data:
             * [{
             *      caption: {
             *          label: ""               // The caption that appears beneath or aside from the image
             *          descpription: ""        // The description that appears beneath or aside from the image
             *      },
             *
             *      url:                        // The url of the image
             * }]
             */
            images: []
        }
    },


    initialize: function(options) {

    }


}, {

    IMAGE_SIZES: {
        THUMB: "thumb",
        SMALL: "small",
        MEDIUM: "medium",
        LARGE: "large"
    },


    IMAGE_SOURCES: {
        FLICKR: "flickr",
        OTHER: "other"
    },


    validate: function() {

    }
});

$$.m.cms = $$.m.cms || {};
$$.m.cms.modules = $$.m.cms.modules || {};
$$.m.cms.modules.ImageGallery = component;

module.exports = component;
