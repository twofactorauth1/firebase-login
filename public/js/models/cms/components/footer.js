/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

define([
    'models/cms/components/componentbase'
], function(ComponentBase) {

    var model = ComponentBase.extend({

        defaults: function() {
            return {

                _id: null,

                anchor: null,

                type: "footer",

                label:"",

                description:"",

                value: "",
                title:""
            }
        }
    });

    $$.m.cms = $$.m.cms || {};
    $$.m.cms.components = $$.m.cms.components || {};
    $$.m.cms.components.Footer = model;

    return model;
});
