/**
 * The Contact Us Component
 *
 * Stores data that represents information required
 * to dispaly Contact Us information
 */
require('./model.base');

var component = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            /**
             * The type of component this is
             */
            type: "contact_us",

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
             * The hours a business is open, array
             *
             * [{
             *      label: ""
             *      value: ""
             * }]
             */
            hours: [],

            /**
             * The location object
             */
            location: {
                address:"",
                address2:"",
                city:"",
                state:"",
                zip:"",
                lat:"",
                lon:"",
                showMap: false,         // true | false
                displayLabel: ""
            },

            contact: {
                email: "",
                phone: ""
            }
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
$$.m.cms.modules.ContactUs = component;

module.exports = component;
