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
            type: "email-header",


            /**
             * The version of the component
             *
             */
            version: 1,

            /**
             *
             *
             */
            txtcolor: '#888888',

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

            spacing: {"pt":0,"pb":0,"pl":0,"pr":0,"mt":0,"mb":"0","mr":"auto","ml":"auto","mw":1024,"usePage":false},

            logo: '<h2><span style="font-family: Quicksand,sans-serif;">Your logo here</span></h2><h2><br></h2><h2><span style="color: rgb(0, 0, 0); font-family: Quicksand, sans-serif;"><strong><span style="font-size: 36px;">Title &amp; Date</span></strong></span></h2><br><br><br><br><br>'

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
$$.m.cms.modules.EmailHeader = component;

module.exports = component;
