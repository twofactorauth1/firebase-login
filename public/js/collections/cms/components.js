/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
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
    'models/cms/components/image-slider',
    'models/cms/components/image-text',
    'models/cms/components/meet-team',
    'models/cms/components/single-post',
    'models/cms/components/signup-form',
    'models/cms/components/blog',
    'models/cms/components/products',
    'models/cms/components/single-page',
], function(Freeform, ContactUs, FeatureBlocks, FeatureList, ImageGallery, ImageSlider, ImageText, MeetTeam, SinglePost, SignupForm, Blog, Products, SinglePage) {

    var components = {
        "freeform": Freeform,
        "contact-us": ContactUs,
        "feature-blocks": FeatureBlocks,
        "feature-list": FeatureList,
        "image-gallery": ImageGallery,
        "image-slider": ImageSlider,
        "image-text": ImageText,
        "meet-team": MeetTeam,
        "single-post": SinglePost,
        "signup-form": SignupForm,
        "blog": Blog,
        "single-post": SinglePost,
        "products": Products,
        "single-page": SinglePage,
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
