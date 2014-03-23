/**
 * The Facebook Comments components
 *
 * Stores data that represents information required
 * to dispaly facebook comments moduel on the page
 */
require('../../model.base');

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
            type: "facebook-comments",

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
$$.m.cms.modules.FacebookComments = component;

module.exports = component;
