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
            type: "masthead",

            /**
             * Version
             */
            version: 1,

            /**
             *
             *
             */
            maintitle : "<h1>Masthead Title</h1>",

            /**
             *
             *
             */
            subtitle : "<h4>A Great place for a subtitle. </h4>",

            /**
             *
             *
             */
            text : "<p>This is where you describe something about your business or product that get the user to scroll or press a button.</p>",

            /**
             *
             *
             */
            txtcolor : "#ffffff",

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
$$.m.cms.modules.MastHead = component;

module.exports = component;
