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


                type: "signup-form",

                label:"",

                description:"",

                formName:"",

                contactType:"",

                /**
                 * An array of objects that contain form field data:
                 * [{
                 *      fieldType:                      // The Type of field that appears in the form
                 *      fieldLabel:                // The Label for the Field for admin purposes
                 *      fieldTag:                        // The Tag for the field used for the placeholde
                 *      required:                  //Whether or not the user has to fill out the field
                 *      visibility:                      // Whether or not the user can see the field
                 *      helpText:                  //The help text that appears below the field
                 *      options:                   // if the field is dropdown or checklist it will have a list of options
                 *      dateFormat:                // if the field is a date, then a format must be chosen
                 * }]
                 */
                fields: []
            }
        }
    });

    $$.m.cms = $$.m.cms || {};
    $$.m.cms.components = $$.m.cms.components || {};
    $$.m.cms.components.SignupForm = model;

    return model;
});
