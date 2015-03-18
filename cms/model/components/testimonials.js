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

            title:"<h1>Thumbnail Slider</h1>",

            txtcolor: "#444",


            /**
             * The type of component this is
             */
            type: "testimonials",

            testimonials : [ 
                {
                    "img" : "",
                    "name" : "Name",
                    "site" : "Site",
                    "text" : "Description",
                    "active" : false
                }, 
                {
                    "img" : "",
                    "name" : "Name",
                    "site" : "Site",
                    "text" : "Description",
                    "active" : false
                }
            ]

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
$$.m.cms.modules.Testimonials = component;

module.exports = component;
