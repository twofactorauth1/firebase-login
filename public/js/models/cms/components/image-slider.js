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

                type: "image-slider",

                label:"",

                description:"",

                images: []
            }
        }
    });

    $$.m.cms = $$.m.cms || {};
    $$.m.cms.components = $$.m.cms.components || {};
    $$.m.cms.components.ImageSlider = model;

    return model;
});
