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
            title:"<h2>Feature List</h2><h3>This is the feature list subtitle.</h3>",


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
                    "content" : "<p style=\"text-align: center;\"><i class=\"fa fa-bar-chart-o\" style=\"font-size:96px;color:#ffffff\"></i><br></p><p style=\"text-align: center;\"><span style=\"font-size:24px;\">Bar Chart</span></p><p style=\"text-align: center;\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.<br></p><p style=\"text-align: center;\"><a style=\"-moz-box-shadow: 0px 1px 0px 0px #ffe0b5;-webkit-box-shadow: 0px 1px 0px 0px #ffe0b5;box-shadow: 0px 1px 0px 0px #ffe0b5;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #fbb450), color-stop(1, #f89306));background:-moz-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-webkit-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-o-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-ms-linear-gradient(top, #fbb450 5%, #f89306 100%);background:linear-gradient(to bottom, #fbb450 5%, #f89306 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#fbb450', endColorstr='#f89306',GradientType=0);background-color:#fbb450;-moz-border-radius:7px;-webkit-border-radius:7px;border-radius:7px;border:1px solid #c97e1c;display:inline-block;color:#ffffff;font-family:trebuchet ms;font-size:28px;font-weight:normal;font-style:%1;padding:20px 72px;text-decoration:none;text-shadow:0px 1px 0px #8f7f24;\" data-cke-saved-href=\"http://\" href=\"http://\">Download</a><br></p>"
                },
                {
                    "content" : "<p style=\"text-align: center;\"><span class=\"fa fa-bar-chart-o\" style=\"font-size:96px;color:#ffffff\"></span><br></p><p style=\"text-align: center;\"><span style=\"font-size:24px;\">Bar Chart</span></p><p style=\"text-align: center;\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.<br></p><p style=\"text-align: center;\"><a style=\"-moz-box-shadow: 0px 1px 0px 0px #ffe0b5;-webkit-box-shadow: 0px 1px 0px 0px #ffe0b5;box-shadow: 0px 1px 0px 0px #ffe0b5;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #fbb450), color-stop(1, #f89306));background:-moz-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-webkit-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-o-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-ms-linear-gradient(top, #fbb450 5%, #f89306 100%);background:linear-gradient(to bottom, #fbb450 5%, #f89306 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#fbb450', endColorstr='#f89306',GradientType=0);background-color:#fbb450;-moz-border-radius:7px;-webkit-border-radius:7px;border-radius:7px;border:1px solid #c97e1c;display:inline-block;color:#ffffff;font-family:trebuchet ms;font-size:28px;font-weight:normal;font-style:%1;padding:20px 72px;text-decoration:none;text-shadow:0px 1px 0px #8f7f24;\" data-cke-saved-href=\"http://\" href=\"http://\">Download</a><br></p>"
                },
                {
                    "content" : "<p style=\"text-align: center;\"><span class=\"fa fa-bar-chart-o\" style=\"font-size:96px;color:#ffffff\"></span><br></p><p style=\"text-align: center;\"><span style=\"font-size:24px;\">Bar Chart</span></p><p style=\"text-align: center;\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.<br></p><p style=\"text-align: center;\"><a style=\"-moz-box-shadow: 0px 1px 0px 0px #ffe0b5;-webkit-box-shadow: 0px 1px 0px 0px #ffe0b5;box-shadow: 0px 1px 0px 0px #ffe0b5;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #fbb450), color-stop(1, #f89306));background:-moz-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-webkit-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-o-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-ms-linear-gradient(top, #fbb450 5%, #f89306 100%);background:linear-gradient(to bottom, #fbb450 5%, #f89306 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#fbb450', endColorstr='#f89306',GradientType=0);background-color:#fbb450;-moz-border-radius:7px;-webkit-border-radius:7px;border-radius:7px;border:1px solid #c97e1c;display:inline-block;color:#ffffff;font-family:trebuchet ms;font-size:28px;font-weight:normal;font-style:%1;padding:20px 72px;text-decoration:none;text-shadow:0px 1px 0px #8f7f24;\" data-cke-saved-href=\"http://\" href=\"http://\">Download</a><br></p>"
                },
                {
                   "content" : "<p style=\"text-align: center;\"><span class=\"fa fa-bar-chart-o\" style=\"font-size:96px;color:#ffffff\"></span><br></p><p style=\"text-align: center;\"><span style=\"font-size:24px;\">Bar Chart</span></p><p style=\"text-align: center;\">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nisi ab, placeat. Officia qui molestiae incidunt est adipisci.<br></p><p style=\"text-align: center;\"><a style=\"-moz-box-shadow: 0px 1px 0px 0px #ffe0b5;-webkit-box-shadow: 0px 1px 0px 0px #ffe0b5;box-shadow: 0px 1px 0px 0px #ffe0b5;background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #fbb450), color-stop(1, #f89306));background:-moz-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-webkit-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-o-linear-gradient(top, #fbb450 5%, #f89306 100%);background:-ms-linear-gradient(top, #fbb450 5%, #f89306 100%);background:linear-gradient(to bottom, #fbb450 5%, #f89306 100%);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#fbb450', endColorstr='#f89306',GradientType=0);background-color:#fbb450;-moz-border-radius:7px;-webkit-border-radius:7px;border-radius:7px;border:1px solid #c97e1c;display:inline-block;color:#ffffff;font-family:trebuchet ms;font-size:28px;font-weight:normal;font-style:%1;padding:20px 72px;text-decoration:none;text-shadow:0px 1px 0px #8f7f24;\" data-cke-saved-href=\"http://\" href=\"http://\">Download</a><br></p>"
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
                color : ""
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
