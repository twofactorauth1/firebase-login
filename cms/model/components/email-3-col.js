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
            type: "email-3-col",


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

            text1: '<img class="fr-dib fr-draggable" src="//s3.amazonaws.com/indigenous-digital-assets/account_355/sandcombo_1467228121007.jpg" style="width: auto;"><br><span style="color: rgb(0, 0, 0); font-family: Quicksand, sans-serif; font-size: 14px;">The four main parts of a flower are generally defined by their positions on the receptacle and not by their function. Many flowers lack some parts or parts may be modified into other functions and/or look like what is typically another part. In some families, like the petals are greatly reduced and in many species the sepals are colorful and petal-like.</span>',

            text2: '<img class="fr-dib fr-draggable" src="//s3.amazonaws.com/indigenous-digital-assets/account_355/pizza_1467228119393.jpg" style="width: auto;"><br><span style="font-family: Quicksand, sans-serif; color: rgb(0, 0, 0); font-size: 14px;">The four main parts of a flower are generally defined by their positions on the receptacle and not by their function. Many flowers lack some parts or parts may be modified into other functions and/or look like what is typically another part. In some families, like the petals are greatly reduced and in many species the sepals are colorful and petal-like.</span>'

            text3: '<img class="fr-dib fr-draggable" src="//s3.amazonaws.com/indigenous-digital-assets/account_355/sandcombo_1467228121007.jpg" style="width: auto;"><br><span style="color: rgb(0, 0, 0); font-size: 14px; font-family: Quicksand, sans-serif;">The four main parts of a flower are generally defined by their positions on the receptacle and not by their function. Many flowers lack some parts or parts may be modified into other functions and/or look like what is typically another part. In some families, like the petals are greatly reduced and in many species the sepals are colorful and petal-like.</span>'

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
$$.m.cms.modules.Email3Col = component;

module.exports = component;
