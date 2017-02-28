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
            type: "coming-soon",

            /**
             * The version of the component
             *
             */
            version: 1,


            /**
             *
             *
             */
            title : "<p style=\"text-align: center;\"><span style=\"font-size:48px;\">Coming Soon</span></p>",

            /**
             *
             *
             */
            text : "<p><span style=\"font-size:18px;\">This site will be launching shortly.</span></p>",

            /**
             *
             *
             */
            txtcolor : "",

            /**
             *
             *
             */
            
            logo: "<img class=\"fr-dib fr-draggable\" src=\"//s3.amazonaws.com/indigenous-digital-assets/account_6/rocket-icon-512x512_1421971689163.png\" src=\"//s3.amazonaws.com/indigenous-digital-assets/account_6/rocket-icon-512x512_1421971689163.png\" width=\"217\" height=\"217\">",

            /**
             *
             *
             */
            bg: {
                img : {
                    url : "//s3.amazonaws.com/indigenous-digital-assets/account_6/clouds-bg_1422163412860.jpg",
                    width : null,
                    height : null,
                    parallax : false,
                    blur : false,
                    overlay: false,
                    show: true
                },
                color : ""
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
$$.m.cms.modules.ComingSoon = component;

module.exports = component;
