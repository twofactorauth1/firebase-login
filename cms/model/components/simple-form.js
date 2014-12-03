/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * Logo list component
 *
 * Stores data that represents a list of logos used for marketing purposes.
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
            type: "simple-form",

            /**
             * Version
             */
            version: 1,

            /**
             *
             *
             */
            maintitle : "<h1>Simple Form</h1>",

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
            imgurl : "http://api.randomuser.me/portraits/med/women/51.jpg",

            /**
             *
             *
             */
            fields : [],

            /**
             *
             *
             */
            contact_type : "Lead",

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
$$.m.cms.modules.SimpleForm = component;

module.exports = component;
