/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Social Component
 *
 * Stores data that represents information required
 * to dispaly Social information
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
            type: "social-link",


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


            networks: [
                {
                    "name" : "facebook",
                    "url" : "http://www.facebook.com",
                    "icon" : "facebook"
                },
                {
                    "name" : "twitter",
                    "url" : "http://www.twitter.com",
                    "icon" : "twitter"
                },
                {
                    "name" : "google-plus",
                    "url" : "http://plus.google.com",
                    "icon" : "google-plus"
                }
            ],

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
$$.m.cms.modules.SocialLink = component;

module.exports = component;
