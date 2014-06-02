/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@INDIGENOUS SOFTWARE, INC. for approval or questions.
 */

define([
    'models/cms/components/componentbase'
], function(ComponentBase) {

    var model = ComponentBase.extend({

        defaults: function() {
            return {

                _id: null,

                anchor: null,

                type: "image-gallery",

                label:"",

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
    $$.m.cms.components = $$.m.cms.components || {};
    $$.m.cms.components.ImageGallery = model;

    return model;
});
