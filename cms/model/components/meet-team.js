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
             * navigation directly to this component
             */
            anchor: null,

            title: '<h2>Meet Team</h2>',

            teamMembers: [
                {
                    "name" : "<p>First Last</p>",
                    "position" : "<p>Position of Person</p>",
                    "profilepic" : "<img alt=\"\" class=\"img-thumbnail img-circle cke_widget_element\" data-cke-saved-src=\"https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg\" src=\"https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg\" data-cke-widget-data=\"%7B%22hasCaption%22%3Afalse%2C%22src%22%3A%22https%3A%2F%2Fs3.amazonaws.com%2Findigenous-account-websites%2Facct_6%2Fmike.jpg%22%2C%22alt%22%3A%22%22%2C%22width%22%3A%22%22%2C%22height%22%3A%22%22%2C%22lock%22%3Atrue%2C%22align%22%3A%22none%22%2C%22classes%22%3A%7B%22img-circle%22%3A1%2C%22img-thumbnail%22%3A1%7D%7D\" data-cke-widget-upcasted=\"1\" data-cke-widget-keep-attr=\"0\" data-widget=\"image\">",
                    "bio" : "<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo laboriosam, officiis vero eius ipsam aspernatur, quidem consequuntur veritatis aut laborum corporis impedit, quam saepe alias quis tempora non. Et, suscipit.</p>",
                    "social" : {
                        "linkedin" : "http://www.linkedin.com/"
                    }
                },
                {
                    "name" : "<p>First Last</p>",
                    "position" : "<p>Position of Person</p>",
                    "profilepic" : "<img alt=\"\" class=\"img-thumbnail img-circle cke_widget_element\" data-cke-saved-src=\"https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg\" src=\"https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg\" data-cke-widget-data=\"%7B%22hasCaption%22%3Afalse%2C%22src%22%3A%22https%3A%2F%2Fs3.amazonaws.com%2Findigenous-account-websites%2Facct_6%2Fmike.jpg%22%2C%22alt%22%3A%22%22%2C%22width%22%3A%22%22%2C%22height%22%3A%22%22%2C%22lock%22%3Atrue%2C%22align%22%3A%22none%22%2C%22classes%22%3A%7B%22img-circle%22%3A1%2C%22img-thumbnail%22%3A1%7D%7D\" data-cke-widget-upcasted=\"1\" data-cke-widget-keep-attr=\"0\" data-widget=\"image\">",
                    "bio" : "<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo laboriosam, officiis vero eius ipsam aspernatur, quidem consequuntur veritatis aut laborum corporis impedit, quam saepe alias quis tempora non. Et, suscipit.</p>",
                    "social" : {
                        "linkedin" : "http://www.linkedin.com/"
                    }
                },
                {
                    "name" : "<p>First Last</p>",
                    "position" : "<p>Position of Person</p>",
                    "profilepic" : "<img alt=\"\" class=\"img-thumbnail img-circle cke_widget_element\" data-cke-saved-src=\"https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg\" src=\"https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg\" data-cke-widget-data=\"%7B%22hasCaption%22%3Afalse%2C%22src%22%3A%22https%3A%2F%2Fs3.amazonaws.com%2Findigenous-account-websites%2Facct_6%2Fmike.jpg%22%2C%22alt%22%3A%22%22%2C%22width%22%3A%22%22%2C%22height%22%3A%22%22%2C%22lock%22%3Atrue%2C%22align%22%3A%22none%22%2C%22classes%22%3A%7B%22img-circle%22%3A1%2C%22img-thumbnail%22%3A1%7D%7D\" data-cke-widget-upcasted=\"1\" data-cke-widget-keep-attr=\"0\" data-widget=\"image\">",
                    "bio" : "<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo laboriosam, officiis vero eius ipsam aspernatur, quidem consequuntur veritatis aut laborum corporis impedit, quam saepe alias quis tempora non. Et, suscipit.</p>",
                    "social" : {
                        "linkedin" : "http://www.linkedin.com/"
                    }
                },
                {
                    "name" : "<p>First Last</p>",
                    "position" : "<p>Position of Person</p>",
                    "profilepic" : "<img alt=\"\" class=\"img-thumbnail img-circle cke_widget_element\" data-cke-saved-src=\"https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg\" src=\"https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg\" data-cke-widget-data=\"%7B%22hasCaption%22%3Afalse%2C%22src%22%3A%22https%3A%2F%2Fs3.amazonaws.com%2Findigenous-account-websites%2Facct_6%2Fmike.jpg%22%2C%22alt%22%3A%22%22%2C%22width%22%3A%22%22%2C%22height%22%3A%22%22%2C%22lock%22%3Atrue%2C%22align%22%3A%22none%22%2C%22classes%22%3A%7B%22img-circle%22%3A1%2C%22img-thumbnail%22%3A1%7D%7D\" data-cke-widget-upcasted=\"1\" data-cke-widget-keep-attr=\"0\" data-widget=\"image\">",
                    "bio" : "<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo laboriosam, officiis vero eius ipsam aspernatur, quidem consequuntur veritatis aut laborum corporis impedit, quam saepe alias quis tempora non. Et, suscipit.</p>",
                    "social" : {
                        "linkedin" : "http://www.linkedin.com/"
                    }
                }
            ],

            version: 1,


            /**
             * The type of component this is
             */
            type: "meet-team"

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
$$.m.cms.modules.MeetTeam = component;

module.exports = component;
