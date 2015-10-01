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
            type: "email-social",


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

            text: '<div style="text-align: center;"><br /><br /><span tabindex="-1" contenteditable="false" class="img-spanclass"><a href="http://twitter.com"><img data-widget="image" alt="" width="40" height="40" src="http://s3.amazonaws.com/indigenous-digital-assets/account_6/twitter_1443645294628.png" /></a><span title="Click and drag to resize">​</span></span>&nbsp;&nbsp;<span tabindex="-1" contenteditable="false" class="img-spanclass"><a href="http://plus.google.com"><img data-widget="image" alt="" width="40" height="40" src="//s3.amazonaws.com/indigenous-digital-assets/account_6/googleplus_1443645291540.png" /></a><span title="Click and drag to resize">​</span></span>&nbsp;&nbsp;<span tabindex="-1" contenteditable="false" class="img-spanclass"><a href="http://linkedin.com"><img data-widget="image" alt="" width="40" height="40" src="//s3.amazonaws.com/indigenous-digital-assets/account_6/linkedin_1443645293120.png" /></a><span title="Click and drag to resize">​</span></span>&nbsp;&nbsp;<span tabindex="-1" contenteditable="false" class="img-spanclass"><a href="http://facebook.com"><img data-widget="image" alt="" width="40" height="40" src="//s3.amazonaws.com/indigenous-digital-assets/account_6/facebook_1443645290644.png" /></a> <span title="Click and drag to resize">​</span></span></div><br /><br /><br />&nbsp;'

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
$$.m.cms.modules.EmailSocial = component;

module.exports = component;
