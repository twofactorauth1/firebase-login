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
            type: "email-2-col",


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

            text1: '<span style="font-size: 14px; font-family: Quicksand, sans-serif; color: rgb(0, 0, 0);">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vitae justo lacinia, rhoncus nulla in, suscipit ipsum. Praesent eu faucibus arcu. Curabitur ac dui ut est rhoncus accumsan et non ex. Pellentesque porttitor nisi at scelerisque rutrum. Maecenas sit amet ornare orci, non rutrum ante. Fusce sed arcu ac tortor porta faucibus et non quam. Fusce placerat nunc pharetra lectus aliquam, nec sagittis arcu ornare. Interdum et malesuada fames ac ante ipsum primis in faucibus</span><br>',

            text2: '<span style="font-family: Quicksand, sans-serif; color: rgb(0, 0, 0); font-size: 14px;">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam vitae justo lacinia, rhoncus nulla in, suscipit ipsum. Praesent eu faucibus arcu. Curabitur ac dui ut est rhoncus accumsan et non ex. Pellentesque porttitor nisi at scelerisque rutrum. Maecenas sit amet ornare orci, non rutrum ante. Fusce sed arcu ac tortor porta faucibus et non quam. Fusce placerat nunc pharetra lectus aliquam, nec sagittis arcu ornare. Interdum et malesuada fames ac ante ipsum primis in faucibus</span><br>'

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
$$.m.cms.modules.Email2Col = component;

module.exports = component;
