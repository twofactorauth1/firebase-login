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
            subtitle : "<h4>Lorem ipsum dolor sit amet, consectetur adipisicing elit. </h4>",

            /**
             *
             *
             */
            text : "<p>Ullam molestiae est, recusandae ratione rem sit, praesentium laborum corporis. Molestiae quidem libero minima earum error minus voluptatum eligendi cum culpa impedit, dicta tenetur quis similique magni rerum doloribus excepturi aspernatur saepe dignissimos ad est aliquid? Voluptas inventore dignissimos possimus perspiciatis enim.</p>",

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
