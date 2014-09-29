/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Feature Blocks component
 *
 * Stores data that represents the 3 or 4 features prominentyly
 * displayed on the website, usually in the for of an image or icon,
 * then a label and possibly a short description below.  These 3 or 4
 * features would be laid out horizontally and well-spaced.
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
            type: "feature-block",

            /**
             * The version of the component
             *
             */
            version: 1,

            /**
             * The Title of the component that shows up on the top
             * (optional)
             */
            title:"Feature Block",

            /**
             *
             *
             */
            subtitle:"This is the subtitle.",

            /**
             *
             *
             */
            text: "This is the main text for the feature block.",

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
                    blur : false
                },
                color : ""
            },

            /**
             *
             *
             */
            btn : {
                text : "Button Text",
                url : "#",
                icon : "fa fa-rocket"
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
$$.m.cms.modules.FeatureBlock = component;

module.exports = component;
