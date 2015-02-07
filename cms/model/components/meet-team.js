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
                    "profilepic" : "https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg",
                    "bio" : "<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo laboriosam, officiis vero eius ipsam aspernatur, quidem consequuntur veritatis aut laborum corporis impedit, quam saepe alias quis tempora non. Et, suscipit.</p>",
                    "networks": [
                        {
                            "name" : "linkedin",
                            "url" : "http://www.linkedin.com",
                            "icon" : "linkedin"
                        }
                    ]
                },
                {
                    "name" : "<p>First Last</p>",
                    "position" : "<p>Position of Person</p>",
                    "profilepic" : "https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg",
                    "bio" : "<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo laboriosam, officiis vero eius ipsam aspernatur, quidem consequuntur veritatis aut laborum corporis impedit, quam saepe alias quis tempora non. Et, suscipit.</p>",
                    "networks": [
                        {
                            "name" : "linkedin",
                            "url" : "http://www.linkedin.com",
                            "icon" : "linkedin"
                        }
                    ]
                },
                {
                    "name" : "<p>First Last</p>",
                    "position" : "<p>Position of Person</p>",
                    "profilepic" : "https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg",
                    "bio" : "<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo laboriosam, officiis vero eius ipsam aspernatur, quidem consequuntur veritatis aut laborum corporis impedit, quam saepe alias quis tempora non. Et, suscipit.</p>",
                    "networks": [
                        {
                            "name" : "linkedin",
                            "url" : "http://www.linkedin.com",
                            "icon" : "linkedin"
                        }
                    ]
                },
                {
                    "name" : "<p>First Last</p>",
                    "position" : "<p>Position of Person</p>",
                    "profilepic" : "https://s3.amazonaws.com/indigenous-account-websites/acct_6/mike.jpg",
                    "bio" : "<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Explicabo laboriosam, officiis vero eius ipsam aspernatur, quidem consequuntur veritatis aut laborum corporis impedit, quam saepe alias quis tempora non. Et, suscipit.</p>",
                    "networks": [
                        {
                            "name" : "linkedin",
                            "url" : "http://www.linkedin.com",
                            "icon" : "linkedin"
                        }
                    ]
                }
            ],

            version: 1,

            txtcolor: "#444",


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
