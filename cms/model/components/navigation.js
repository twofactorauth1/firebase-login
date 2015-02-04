/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Contact Us Component
 *
 * Stores data that represents information required
 * to dispaly Contact Us information
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
            type: "navigation",


            /**
             * The version of the component
             *
             */
            version: 1,

            /**
             *
             *
             */
            txtcolor: null,

            /**
             *
             *
             */
            logo: '<img src=\"https://s3-us-west-2.amazonaws.com/indigenous-admin/logo-indi-white.png\" width=\"220\" height=\"60\">',

            /**
             *
             *
             */
             nav: {
                bg: "#017ebe"
             },

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
                color : "#89c4f4"
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
$$.m.cms.modules.Navigation = component;

module.exports = component;
