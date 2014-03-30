/**
 * COPYRIGHT CMConsulting LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact christopher.mina@gmail.com for approval or questions.
 */

/**
 * The Feature List Compare components
 *
 * Stores data that represents a feature list comparison
 * between multiple products or services.  Maximum products
 * or services for comparison is 4.
 */
require('../../base.model.js');

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
            type: "feature-list-compare",

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
             * a list of the different products being compared
             *
             * [{
             *      id: ""                  // The id of the product being used for cmoparison
             *      label: ""               // The label name of the product shown to customers,
             *                              // representing the product used for comparison
             * ]}
             */
            products: [],

            /**
             * An array of features being compared for across products
             * [{
             *      label: "",              // The label to display beneat the icon
             *      description: "",        // The description to display beneath th elabel
             *
             *      [{
             *          productId: ""       // The id of the product
             *          isPresent: false    // Whether or not the feature is present on that product
             *      }]
             *      compare: []         // The actual comparisons, see above
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
$$.m.cms.modules.FeatureListCompare = component;

module.exports = component;
