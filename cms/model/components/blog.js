/**
 * COPYRIGHT INDIGENOUS SOFTWARE, INC., LLC 2014
 *
 * All use or reproduction of any or all of this content must be approved.
 * Please contact info@indigenous.io for approval or questions.
 */

/**
 * Freeform component
 *
 * Stores data that represents a freeform HTML formatted region
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
            type: "blog",

            /**
             * The version of the component
             *
             */
            version: 1,

            /**
             * The Title of the component that shows up on the top
             * (optional)
             */
            title:"Blog",

            /**
             *
             *
             */
            subtitle:"This is the subtitle.",

            /**
             *
             *
             */
            text: "This is the main text for the blog.",

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
             * The default sort order of component
             */
            postorder: null
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
$$.m.cms.modules.Blog = component;

module.exports = component;
