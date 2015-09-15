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
             *
             *
             */
            title: "<h3>CONTACT US</h3>",

            /**
             *
             *
             */
            subtitle: "<h5>We will be happy to assist you!</h5>",

            /**
             *
             *
             */
            text: "",

            /**
             *
             *
             */
            imgurl: "",
            /**
             *
             *
             */
            showHours: true,
            /**
             *
             *
             */
            boxColor: "#000",
            /**
             *
             *
             */
            boxOpacity: 0.5,
            /**
             * The hours a business is open, array
             *[
             *  "mon-friday: 8-5",
             *  "saturday: 9-4",
             *  "sunday: "closed"
             * ]
             */

            splitHours: false,

            hours: [{day: "Mon", start:"9:00 am",end:"5:00 pm", start2:"9:00 am", end2:"5:00 pm", closed:false, split:false, wholeday:false},
               {day: "Tue", start:"9:00 am",end:"5:00 pm", start2:"9:00 am", end2:"5:00 pm", closed:false, split:false, wholeday:false},
               {day: "Wed", start:"9:00 am",end:"5:00 pm", start2:"9:00 am", end2:"5:00 pm", closed:false, split:false, wholeday:false},
               {day: "Thu", start:"9:00 am",end:"5:00 pm", start2:"9:00 am", end2:"5:00 pm", closed:false, split:false, wholeday:false},
               {day: "Fri", start:"9:00 am",end:"5:00 pm", start2:"9:00 am", end2:"5:00 pm", closed:false, split:false, wholeday:false},
               {day: "Sat", start:"9:00 am",end:"5:00 pm", start2:"9:00 am", end2:"5:00 pm", closed:true, split:false, wholeday:false},
               {day: "Sun", start:"9:00 am",end:"5:00 pm", start2:"9:00 am", end2:"5:00 pm", closed:true, split:false, wholeday:false}],

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
            txtcolor: "#fff",

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
                color : "#FFFFFF"
            },

             /**
             * Custom fields Hours and Address(If not custom then business details)
             */
            custom:{
                hours: false,
                address: false
            },

            boxProperties: {}
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
