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

            title: '',

            teamMembers: [

                {
                    "name" : "<p><span class=\"ng-binding\"><span class=\"ng-binding\">Mike Trevino</span></span></p>",
                    "position" : "<p><span class=\"ng-binding\"><span class=\"ng-binding\">Chief Executive Officer</span></span></p>",
                    "profilepic" : "https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg",
                    "bio" : "<p><span class=\"ng-binding\"><span class=\"ng-binding\">Mike is a senior business leader with global experience developing high growth companies and a focus on delivering advanced software.</span></span></p>"
                },
                {
                    "name" : "<p><span class=\"ng-binding\"><span class=\"ng-binding\">John Eisenschmidt</span></span></p>",
                    "position" : "<p><span class=\"ng-binding\"><span class=\"ng-binding\">VP, Product Management</span></span></p>",
                    "profilepic" : "https://s3.amazonaws.com/indigenous-account-websites/acct_6/john.jpg",
                    "bio" : "<p><span class=\"ng-binding\"><span class=\"ng-binding\">Solving problems at the intersection of business and information technology, John identifies best practices and simple solutions for your business.</span></span></p>"
                },
                {
                    "name" : "<p><span class=\"ng-binding\"><span class=\"ng-binding\">Noël Norcross </span></span></p>",
                    "position" : "<p><span class=\"ng-binding\"><span class=\"ng-binding\">Director of Content</span></span></p>",
                    "profilepic" : "https://s3.amazonaws.com/indigenous-account-websites/acct_6/noel.jpg",
                    "bio" : "<p><span class=\"ng-binding\"><span class=\"ng-binding\">With a diverse background as a writer, editor, and educator, Noël collaborates with businesses to tell their stories creatively and compellingly.</span></span></p>"
                },
                {
                    "name" : "<p><span class=\"ng-binding\"><span class=\"ng-binding\">Brad Risse</span></span></p>",
                    "position" : "<p><span class=\"ng-binding\"><span class=\"ng-binding\">UI Designer</span></span></p>",
                    "profilepic" : "https://s3.amazonaws.com/indigenous-account-websites/acct_6/brad.jpg",
                    "bio" : "<p><span class=\"ng-binding\"><span class=\"ng-binding\">Brad utilizes his programming skills to produce elegant and very functional websites and mobile apps focused on the user experience.</span></span></p>"
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
