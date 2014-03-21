/**
 * The Facebook Likes components
 *
 * Stores data that represents information required
 * to allow user to like a page.
 */
require('./model.base');

var component = $$.m.ModelBase.extend({

    defaults: function() {
        return {

            /**
             * The type of component this is
             */
            type: "facebook_likes",

            /**
             * The label for the component
             * (optional)
             */
            label:"",

            /**
             * A description that appears at the top of the component
             * (optional)
             */
            description:"",

            /**
             * Relevant credentials to associate the facebook comments
             *
             * {
             *      username: "",
             *      socialId: "",
             * }
             */
            credentials: null,

            /**
             * Comment options
             */
            options: null
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
$$.m.cms.modules.FacebookLikes = component;

module.exports = component;
