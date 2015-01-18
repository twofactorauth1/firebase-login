/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Feature List components
 *
 * Stores data that represents a feature list for a product
 * or service
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
            type: "feature-list",

            /**
             * Version
             */
            version: 1,

            /**
             *
             *
             */
            title:"<h2 style=\"text-align: center;\">Feature List</h2><h3 style=\"text-align: center;\">This is the feature List Title</h3>",


            /**
             * An array of features of the form
             * [{
             *      label: "",              //The label to display beneat the icon
             *      description: "",        //The description to display beneath th elabel
             *      url: null               //The URL of the icon / image
             *      iconClass: null         //The classname of the icon to display
             * ]}
             */
            features: [
                {
                    "top" : "<span tabindex=\"-1\" contenteditable=\"false\" data-cke-widget-wrapper=\"1\" data-cke-filter=\"off\" class=\"cke_widget_wrapper cke_widget_inline\" data-cke-display-name=\"span\" data-cke-widget-id=\"0\"><span class=\"fa fa-arrow-right  \" data-cke-widget-keep-attr=\"0\" data-widget=\"FontAwesome\" data-cke-widget-data=\"%7B%22class%22%3A%22fa%20fa-arrow-right%20%20%22%2C%22color%22%3A%22%230061a7%22%2C%22size%22%3A%2296%22%2C%22classes%22%3A%7B%22fa-android%22%3A1%2C%22fa%22%3A1%7D%2C%22flippedRotation%22%3A%22%22%7D\" style=\"color:#0061a7;font-size:96px;\"></span>",
                    "content" : "<p style=\"text-align: center;\"><span style=\"font-size:24px;\">Feature One</span></p><p style=\"text-align: center;\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</p><p style=\"text-align: center;\"><a style=\"-moz-box-shadow:inset 0px 1px 0px 0px #54a3f7;-webkit-box-shadow:inset 0px 1px 0px 0px #54a3f7;box-shadow:inset 0px 1px 0px 0px #54a3f7;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #007dc1), color-stop(1, #0061a7));background:-moz-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-webkit-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-o-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-ms-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:linear-gradient(to bottom, #007dc1 5%, #0061a7 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#007dc1', endColorstr='#0061a7',GradientType=0);background-color:#007dc1;-moz-border-radius:3px;-webkit-border-radius:3px;border-radius:3px;border:1px solid #124d77;display:inline-block;color:#ffffff;font-family:verdana;font-size:19px;font-weight:normal;font-style:normal;padding:14px 70px;text-decoration:none;text-shadow:0px 1px 0px #154682;\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></p>"
                },
                {
                    "top" : "<span tabindex=\"-1\" contenteditable=\"false\" data-cke-widget-wrapper=\"1\" data-cke-filter=\"off\" class=\"cke_widget_wrapper cke_widget_inline\" data-cke-display-name=\"span\" data-cke-widget-id=\"0\"><span class=\"fa fa-arrow-right  \" data-cke-widget-keep-attr=\"0\" data-widget=\"FontAwesome\" data-cke-widget-data=\"%7B%22class%22%3A%22fa%20fa-arrow-right%20%20%22%2C%22color%22%3A%22%230061a7%22%2C%22size%22%3A%2296%22%2C%22classes%22%3A%7B%22fa-android%22%3A1%2C%22fa%22%3A1%7D%2C%22flippedRotation%22%3A%22%22%7D\" style=\"color:#0061a7;font-size:96px;\"></span>",
                    "content" : "<p style=\"text-align: center;\"><span style=\"font-size:24px;\">Feature One</span></p><p style=\"text-align: center;\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</p><p style=\"text-align: center;\"><a style=\"-moz-box-shadow:inset 0px 1px 0px 0px #54a3f7;-webkit-box-shadow:inset 0px 1px 0px 0px #54a3f7;box-shadow:inset 0px 1px 0px 0px #54a3f7;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #007dc1), color-stop(1, #0061a7));background:-moz-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-webkit-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-o-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-ms-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:linear-gradient(to bottom, #007dc1 5%, #0061a7 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#007dc1', endColorstr='#0061a7',GradientType=0);background-color:#007dc1;-moz-border-radius:3px;-webkit-border-radius:3px;border-radius:3px;border:1px solid #124d77;display:inline-block;color:#ffffff;font-family:verdana;font-size:19px;font-weight:normal;font-style:normal;padding:14px 70px;text-decoration:none;text-shadow:0px 1px 0px #154682;\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></p>"
                },
                {
                    "top" : "<span tabindex=\"-1\" contenteditable=\"false\" data-cke-widget-wrapper=\"1\" data-cke-filter=\"off\" class=\"cke_widget_wrapper cke_widget_inline\" data-cke-display-name=\"span\" data-cke-widget-id=\"0\"><span class=\"fa fa-arrow-right  \" data-cke-widget-keep-attr=\"0\" data-widget=\"FontAwesome\" data-cke-widget-data=\"%7B%22class%22%3A%22fa%20fa-arrow-right%20%20%22%2C%22color%22%3A%22%230061a7%22%2C%22size%22%3A%2296%22%2C%22classes%22%3A%7B%22fa-android%22%3A1%2C%22fa%22%3A1%7D%2C%22flippedRotation%22%3A%22%22%7D\" style=\"color:#0061a7;font-size:96px;\"></span>",
                    "content" : "<p style=\"text-align: center;\"><span style=\"font-size:24px;\">Feature One</span></p><p style=\"text-align: center;\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</p><p style=\"text-align: center;\"><a style=\"-moz-box-shadow:inset 0px 1px 0px 0px #54a3f7;-webkit-box-shadow:inset 0px 1px 0px 0px #54a3f7;box-shadow:inset 0px 1px 0px 0px #54a3f7;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #007dc1), color-stop(1, #0061a7));background:-moz-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-webkit-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-o-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-ms-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:linear-gradient(to bottom, #007dc1 5%, #0061a7 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#007dc1', endColorstr='#0061a7',GradientType=0);background-color:#007dc1;-moz-border-radius:3px;-webkit-border-radius:3px;border-radius:3px;border:1px solid #124d77;display:inline-block;color:#ffffff;font-family:verdana;font-size:19px;font-weight:normal;font-style:normal;padding:14px 70px;text-decoration:none;text-shadow:0px 1px 0px #154682;\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></p>"
                },
                {
                    "top" : "<span tabindex=\"-1\" contenteditable=\"false\" data-cke-widget-wrapper=\"1\" data-cke-filter=\"off\" class=\"cke_widget_wrapper cke_widget_inline\" data-cke-display-name=\"span\" data-cke-widget-id=\"0\"><span class=\"fa fa-arrow-right  \" data-cke-widget-keep-attr=\"0\" data-widget=\"FontAwesome\" data-cke-widget-data=\"%7B%22class%22%3A%22fa%20fa-arrow-right%20%20%22%2C%22color%22%3A%22%230061a7%22%2C%22size%22%3A%2296%22%2C%22classes%22%3A%7B%22fa-android%22%3A1%2C%22fa%22%3A1%7D%2C%22flippedRotation%22%3A%22%22%7D\" style=\"color:#0061a7;font-size:96px;\"></span>",
                    "content" : "<p style=\"text-align: center;\"><span style=\"font-size:24px;\">Feature One</span></p><p style=\"text-align: center;\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.</p><p style=\"text-align: center;\"><a style=\"-moz-box-shadow:inset 0px 1px 0px 0px #54a3f7;-webkit-box-shadow:inset 0px 1px 0px 0px #54a3f7;box-shadow:inset 0px 1px 0px 0px #54a3f7;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #007dc1), color-stop(1, #0061a7));background:-moz-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-webkit-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-o-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:-ms-linear-gradient(top, #007dc1 5%, #0061a7 100%);background:linear-gradient(to bottom, #007dc1 5%, #0061a7 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#007dc1', endColorstr='#0061a7',GradientType=0);background-color:#007dc1;-moz-border-radius:3px;-webkit-border-radius:3px;border-radius:3px;border:1px solid #124d77;display:inline-block;color:#ffffff;font-family:verdana;font-size:19px;font-weight:normal;font-style:normal;padding:14px 70px;text-decoration:none;text-shadow:0px 1px 0px #154682;\" data-cke-saved-href=\"http://\" href=\"http://\">Learn More</a></p>"
                }
            ],

            /**
             *
             *
             */
            txtcolor : "",

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
                color : "#e7e7e7"
            },

            /**
             *
             *
             */
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
$$.m.cms.modules.FeatureList = component;

module.exports = component;
