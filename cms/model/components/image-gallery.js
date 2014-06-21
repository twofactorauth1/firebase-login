/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Image Gallery component.
 *
 * Stores data that supports a list of images or a data source of images
 * to be displayed in a tiled fashion
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
            type: "image-gallery",

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
             *      label:                      // The caption that appears beneath or aside from the image
             *      description,                // The description that appears beneath or aside from the image
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
