/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * The Social Feed copmonent
 *
 * Stores data that represents a connection to a social feed
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
            type: "social-feed",

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
             * The social feed type
             *
             * facebook | twitter | flickr | pinterest | instagram | blog
             */
            feedType: "",

            /**
             * The public URL to the feed if applicable
             */
            url: "",

            /**
             * Relevant credentials to access the given social feed
             *
             * {
             *      username: "",
             *      socialId: "",
             * }
             */
            credentials: null,

            /**
             * Options used to determine what to pull
             */
            options: null,
            title:""
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
