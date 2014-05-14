/**
 * COPYRIGHT INDIGENOUS.IO, LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'models/cms/components/freeform',
    'models/cms/components/contact-us',
    'models/cms/components/feature-blocks',
    'models/cms/components/feature-list',
    'models/cms/components/image-gallery',
    'models/cms/components/image-slider'
], function(Freeform, ContactUs, FeatureBlocks, FeatureList, ImageGallery, ImageSlider) {

    var components = {
        "freeform": Freeform,
        "contact-us": ContactUs,
        "feature-blocks": FeatureBlocks,
        "feature-list": FeatureList,
        "image-gallery": ImageGallery,
        "image-slider": ImageSlider
    };

    var collection = Backbone.Collection.extend({

        model: function(attr, options) {
            var type = attr.type;
            var component = components[type];

            return new component(attr, options);
        },


        url: function() {
            return "";
        }
    });

    $$.c.cms = $$.c.cms || {};
    $$.c.cms.Components = collection;

    return collection
});
