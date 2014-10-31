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
            txtcolor: "#ffffff",

            /**
             *
             *
             */
            title : "Coming Soon",

            /**
             *
             *
             */
            subtitle : "We are getting everything ready.",

            /**
             *
             *
             */
            text : "This site will be avaliable soon.",

            /**
             *
             *
             */
            txtcolor : "#2aa9c9",

            /**
             *
             *
             */
            logo : "https://s3.amazonaws.com/indigenous-account-websites/acct_30/logo.png",

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
                color : "#4bb0cb"
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
