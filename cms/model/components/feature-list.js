/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Feature List components
 *
 * Stores data that represents a feature list for a product
 * or service
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
            type: "feature-list",

            /**
             * Version
             */
            version: 1,

            /**
             *
             *
             */
            maintitle:"<h2>Feature List</h2>",

            /**
             *
             *
             */
            subtitle : "<h3>This is the feature list subtitle.</h3>",


            /**
             * An array of features of the form
             * [{
             *      label: "",              //The label to display beneat the icon
             *      description: "",        //The description to display beneath th elabel
             *      url: null               //The URL of the icon / image
             *      iconClass: null         //The classname of the icon to display
             * ]}
             */
            features: [
                {
                    "title" : "Feature One",
                    "subtitle" : "This is a great feature!",
                    "icon" : "fa fa-credit-card"
                },
                {
                    "title" : "Feature One",
                    "subtitle" : "This is a great feature!",
                    "icon" : "fa fa-credit-card"
                },
                {
                    "title" : "Feature One",
                    "subtitle" : "This is a great feature!",
                    "icon" : "fa fa-credit-card"
                },
                {
                    "title" : "Feature One",
                    "subtitle" : "This is a great feature!",
                    "icon" : "fa fa-credit-card"
                }
            ],

            /**
             *
             *
             */
            txtcolor : "",

            /**
             *
             *
             */
            bg: {
                img : {
                    url : "",
                    width : null,
                    height : null,
                    parallax : false,
                    blur : false,
                    overlay: false,
                    show: false
                },
                color : ""
            },

            /**
             *
             *
             */
            btn : {
                visibility: true,
                text : "Learn More",
                url : "#features",
                icon : "fa fa-rocket"
            },

            /**
             *
             *
             */
            visibility: true
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
