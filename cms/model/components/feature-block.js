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
            title:"<h1>Feature Block Title</h1>",

            /**
             *
             *
             */
            subtitle:"<h3>This is the feature block subtitle.</h3>",

            /**
             *
             *
             */
            text: "<h5>The Feature Block component is great for a quick testimonial or a list of <br> features for a single product. It works great with an image background and parallax.</h5>",

            /**
             *
             *
             */
            txtcolor: "#888888",

            /**
             *
             *
             */
            bg: {
                img : {
                    url : "http://s3.amazonaws.com/indigenous-digital-assets/account_6/feature-block_1416870905848.jpg",
                    width : 838,
                    height : 470,
                    parallax : true,
                    blur : false,
                    overlay: false,
                    show: false
                },
                color : "#f7f7f7"
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
