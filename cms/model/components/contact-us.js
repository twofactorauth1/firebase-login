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
            type: "contact-us",

            /**
             * The version of the component
             *
             */
            version: 1,

            /**
             * The hours a business is open, array
             *[
             *  "mon-friday: 8-5",
             *  "saturday: 9-4",
             *  "sunday: "closed"
             * ]
             */
            hours: [],

            /**
             * The location object
             */
            location: {
                address:"",
                address2:"",
                city:"",
                state:"",
                zip:"",
                lat:"",
                lon:"",
                showMap: false,
                addressDisplayLabel: ""
            },

            /**
             * Email and phone
             */
            contact: {
                email: "",
                phone: ""
            },

            /**
             *
             *
             */
            txtcolor: null,

            title: "Title",

            subtitle: "subtitle",

            text: "",

            imgurl: "",

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
$$.m.cms.modules.ContactUs = component;

module.exports = component;
