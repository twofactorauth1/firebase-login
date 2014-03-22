/**
 * The Feature List components
 *
 * Stores data that represents a feature list for a product
 * or service
 */
require('./model.base');

var component = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            /**
             * The type of component this is
             */
            type: "feature_list",

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
             * An array of features of the form
             * [{
             *      label: "",              //The label to display beneat the icon
             *      description: "",        //The description to display beneath th elabel
             *      url: null               //The URL of the icon / image
             *      iconClass: null         //The classname of the icon to display
             * ]}
             */
            features: []
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
$$.m.cms.modules.FeatureList = component;

module.exports = component;
